import { useEffect, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, Text, TextInput, View } from 'react-native';

import { AppButton } from '@/components/AppButton';
import { EmbeddedPlayer } from '@/components/EmbeddedPlayer';
import { FilterChips, type FilterChipOption } from '@/components/FilterChips';
import { PlatformBadge } from '@/components/PlatformBadge';
import { PreviewThumbnail } from '@/components/PreviewThumbnail';
import { TagList } from '@/components/TagList';
import { platformColors, radius, spacing, textStyle, useThemeColors } from '@/constants/theme';
import type { DerivedLinkPreview, LinkFormValues } from '@/features/links/types';
import { parseTagInput, stringifyTags } from '@/utils/tags';

interface LinkEditorFormProps {
  form: LinkFormValues;
  preview: DerivedLinkPreview;
  categories: string[];
  isEnriching?: boolean;
  saveLabel: string;
  onSave: () => void;
  onChangeField: <Key extends keyof LinkFormValues>(key: Key, value: LinkFormValues[Key]) => void;
  disabled?: boolean;
  defaultShowAdditional?: boolean;
  mode?: 'create' | 'edit';
}

function InputField({
  label,
  value,
  onChangeText,
  placeholder,
  multiline = false,
}: {
  label: string;
  value: string;
  onChangeText: (value: string) => void;
  placeholder: string;
  multiline?: boolean;
}) {
  const colors = useThemeColors();

  return (
    <View style={{ gap: 6 }}>
      <Text style={{ ...textStyle('700'), color: colors.text, fontSize: 14 }}>{label}</Text>
      <TextInput
        autoCapitalize="none"
        autoCorrect={false}
        multiline={multiline}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={colors.textSoft}
        style={{
          ...textStyle('400'),
          backgroundColor: colors.surface,
          borderColor: colors.border,
          borderRadius: radius.md,
          borderWidth: 1,
          color: colors.text,
          fontSize: 14,
          lineHeight: multiline ? 21 : undefined,
          minHeight: multiline ? 96 : 48,
          paddingHorizontal: 12,
          paddingVertical: multiline ? 12 : 11,
          textAlignVertical: multiline ? 'top' : 'center',
        }}
        value={value}
      />
    </View>
  );
}

function SectionCard({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: ReactNode;
}) {
  const colors = useThemeColors();

  return (
    <View
      style={{
        backgroundColor: colors.surface,
        borderRadius: radius.lg,
        gap: 14,
        padding: 14,
      }}
    >
      <View style={{ gap: 4 }}>
        <Text style={{ ...textStyle('800'), color: colors.text, fontSize: 16 }}>{title}</Text>
        <Text style={{ ...textStyle('400'), color: colors.textMuted, fontSize: 13, lineHeight: 19 }}>
          {description}
        </Text>
      </View>
      {children}
    </View>
  );
}

export function LinkEditorForm({
  form,
  preview,
  categories,
  isEnriching = false,
  saveLabel,
  onSave,
  onChangeField,
  disabled = false,
  defaultShowAdditional = false,
  mode = 'create',
}: LinkEditorFormProps) {
  const colors = useThemeColors();
  const previewTitle = form.title || preview.title || '링크 미리보기';
  const activePlatformColor = platformColors[form.detectedPlatform];
  const [showAdditional, setShowAdditional] = useState(defaultShowAdditional);
  const hasAdditionalContent = Boolean(
    form.tags.length || form.summary.trim() || form.memo.trim() || form.isFavorite,
  );
  const categoryOptions = useMemo<FilterChipOption<LinkFormValues['category']>[]>(
    () =>
      categories.map((category) => ({
        label: category,
        value: category,
      })),
    [categories],
  );

  useEffect(() => {
    setShowAdditional(defaultShowAdditional);
  }, [defaultShowAdditional]);

  const footerDescription =
    mode === 'create'
      ? '기본 정보만 입력하고 바로 저장할 수 있어요.'
      : '필요한 내용만 빠르게 수정하고 저장해 보세요.';
  const additionalDescription = hasAdditionalContent
    ? '추가 정보가 입력되어 있어요.'
    : '태그, 요약, 메모는 필요할 때만 열어 적어도 충분해요.';

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
      <View style={{ backgroundColor: colors.background, flex: 1 }}>
        <ScrollView
          contentContainerStyle={{
            gap: spacing.md,
            padding: spacing.md,
            paddingBottom: 124,
          }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <SectionCard
            description="URL과 제목, 카테고리만 먼저 입력해도 바로 저장할 수 있어요."
            title="기본 정보"
          >
            <InputField
              label="URL"
              onChangeText={(value) => onChangeField('originalUrl', value)}
              placeholder="링크를 붙여넣어 주세요"
              value={form.originalUrl}
            />

            <View
              style={{
                alignItems: 'center',
                backgroundColor: colors.surfaceMuted,
                borderRadius: radius.md,
                flexDirection: 'row',
                gap: 10,
                paddingHorizontal: 12,
                paddingVertical: 10,
              }}
            >
              <PlatformBadge platform={form.detectedPlatform} />
              <View style={{ flex: 1, gap: 2 }}>
                <Text style={{ ...textStyle('700'), color: colors.text, fontSize: 13 }}>플랫폼 자동 감지</Text>
                <Text
                  style={{
                    ...textStyle('400'),
                    color: form.originalUrl.trim() ? activePlatformColor.text : colors.textMuted,
                    fontSize: 12,
                  }}
                >
                  {form.originalUrl.trim()
                    ? isEnriching
                      ? `${form.detectedPlatform} 정보를 불러오는 중이에요.`
                      : `${form.detectedPlatform} 링크로 인식했고 카테고리/태그를 추천했어요.`
                    : 'URL을 입력하면 플랫폼을 자동으로 감지하고 카테고리/태그를 추천해요.'}
                </Text>
              </View>
            </View>

            <View style={{ gap: 8 }}>
              <Text style={{ ...textStyle('700'), color: colors.text, fontSize: 14 }}>미리보기</Text>
              {preview.embedUrl ? (
                <EmbeddedPlayer
                  height={preview.detectedPlatform === 'Instagram' ? 260 : 180}
                  platform={preview.detectedPlatform}
                  title={previewTitle}
                  url={preview.embedUrl}
                />
              ) : (
                <PreviewThumbnail
                  aspectRatio={16 / 9}
                  platform={form.detectedPlatform}
                  sourceUrl={form.originalUrl || preview.normalizedUrl}
                  subtitle={preview.hostnameLabel}
                  thumbnailUrl={form.thumbnailUrl}
                  title={previewTitle}
                />
              )}
            </View>

            <InputField
              label="제목"
              onChangeText={(value) => onChangeField('title', value)}
              placeholder="제목을 입력해 주세요"
              value={form.title}
            />

            <View style={{ gap: 8 }}>
              <Text style={{ ...textStyle('700'), color: colors.text, fontSize: 14 }}>카테고리</Text>
              <FilterChips
                activeValue={form.category}
                compact
                onChange={(value) => onChangeField('category', value as LinkFormValues['category'])}
                options={categoryOptions}
              />
            </View>

            {form.tags.length ? (
              <View style={{ gap: 8 }}>
                <Text style={{ ...textStyle('700'), color: colors.text, fontSize: 14 }}>추천 태그</Text>
                <TagList limit={6} tags={form.tags} />
              </View>
            ) : null}
          </SectionCard>

          <View
            style={{
              backgroundColor: colors.surface,
              borderRadius: radius.lg,
              padding: 14,
            }}
          >
            <Pressable
              onPress={() => setShowAdditional((current) => !current)}
              style={({ pressed }) => ({
                alignItems: 'center',
                flexDirection: 'row',
                gap: 12,
                opacity: pressed ? 0.84 : 1,
              })}
            >
              <View style={{ flex: 1, gap: 4 }}>
                <Text style={{ ...textStyle('800'), color: colors.text, fontSize: 16 }}>추가 정보</Text>
                <Text style={{ ...textStyle('400'), color: colors.textMuted, fontSize: 13, lineHeight: 19 }}>
                  {additionalDescription}
                </Text>
              </View>
              <Ionicons
                color={colors.textSoft}
                name={showAdditional ? 'chevron-up-outline' : 'chevron-down-outline'}
                size={18}
              />
            </Pressable>

            {showAdditional ? (
              <View style={{ gap: 12, marginTop: 14 }}>
                <InputField
                  label="태그"
                  onChangeText={(value) => onChangeField('tags', parseTagInput(value))}
                  placeholder="예: 레퍼런스, 디자인, 회의"
                  value={stringifyTags(form.tags)}
                />

                <InputField
                  label="요약"
                  multiline
                  onChangeText={(value) => onChangeField('summary', value)}
                  placeholder="짧게 저장해두면 다시 볼 때 더 빠르게 찾을 수 있어요"
                  value={form.summary}
                />

                <InputField
                  label="메모"
                  multiline
                  onChangeText={(value) => onChangeField('memo', value)}
                  placeholder="개인 메모를 남겨 보세요"
                  value={form.memo}
                />

                <Pressable
                  onPress={() => onChangeField('isFavorite', !form.isFavorite)}
                  style={({ pressed }) => ({
                    alignItems: 'center',
                    backgroundColor: form.isFavorite ? colors.warningMuted : colors.surfaceMuted,
                    borderColor: form.isFavorite ? '#F6C86A' : colors.border,
                    borderRadius: radius.md,
                    borderWidth: 1,
                    flexDirection: 'row',
                    gap: 10,
                    opacity: pressed ? 0.9 : 1,
                    paddingHorizontal: 12,
                    paddingVertical: 12,
                  })}
                >
                  <Ionicons
                    color={form.isFavorite ? '#F59E0B' : colors.textSoft}
                    name={form.isFavorite ? 'star' : 'star-outline'}
                    size={18}
                  />
                  <View style={{ flex: 1, gap: 2 }}>
                    <Text style={{ ...textStyle('700'), color: colors.text, fontSize: 14 }}>즐겨찾기</Text>
                    <Text style={{ ...textStyle('400'), color: colors.textMuted, fontSize: 12 }}>
                      나중에 보관함에서 더 빨리 찾을 수 있어요.
                    </Text>
                  </View>
                </Pressable>
              </View>
            ) : null}
          </View>
        </ScrollView>

        <View
          style={{
            backgroundColor: colors.background,
            borderTopColor: colors.border,
            borderTopWidth: 1,
            gap: 8,
            paddingHorizontal: spacing.md,
            paddingTop: 12,
            paddingBottom: 14,
          }}
        >
          <Text style={{ ...textStyle('400'), color: colors.textMuted, fontSize: 12 }}>
            {footerDescription}
          </Text>
          <AppButton disabled={disabled} label={saveLabel} onPress={onSave} />
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}
