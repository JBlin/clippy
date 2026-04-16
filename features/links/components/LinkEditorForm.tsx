import { Ionicons } from '@expo/vector-icons';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, Text, TextInput, View } from 'react-native';

import { AppButton } from '@/components/AppButton';
import { EmbeddedPlayer } from '@/components/EmbeddedPlayer';
import { FilterChips, type FilterChipOption } from '@/components/FilterChips';
import { PlatformBadge } from '@/components/PlatformBadge';
import { PreviewThumbnail } from '@/components/PreviewThumbnail';
import { LINK_CATEGORIES } from '@/constants/linkOptions';
import { colors, platformColors, radius, spacing, textStyle } from '@/constants/theme';
import type { DerivedLinkPreview, LinkFormValues } from '@/features/links/types';
import { parseTagInput, stringifyTags } from '@/utils/tags';

interface LinkEditorFormProps {
  form: LinkFormValues;
  preview: DerivedLinkPreview;
  isEnriching?: boolean;
  saveLabel: string;
  onSave: () => void;
  onChangeField: <Key extends keyof LinkFormValues>(key: Key, value: LinkFormValues[Key]) => void;
  disabled?: boolean;
}

const categoryOptions: FilterChipOption<LinkFormValues['category']>[] = LINK_CATEGORIES.map((category) => ({
  label: category,
  value: category,
}));

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
  return (
    <View style={{ gap: 8 }}>
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
          fontSize: 15,
          lineHeight: multiline ? 22 : undefined,
          minHeight: multiline ? 112 : 52,
          paddingHorizontal: 14,
          paddingVertical: 14,
          textAlignVertical: multiline ? 'top' : 'center',
        }}
        value={value}
      />
    </View>
  );
}

export function LinkEditorForm({
  form,
  preview,
  isEnriching = false,
  saveLabel,
  onSave,
  onChangeField,
  disabled = false,
}: LinkEditorFormProps) {
  const previewTitle = form.title || preview.title || '링크 미리보기';
  const activePlatformColor = platformColors[form.detectedPlatform];

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={{ flex: 1 }}
    >
      <ScrollView
        contentContainerStyle={{
          gap: spacing.lg,
          padding: spacing.lg,
          paddingBottom: spacing.xxl,
        }}
        keyboardShouldPersistTaps="handled"
        style={{ backgroundColor: colors.background }}
      >
        <View style={{ gap: 8 }}>
          <Text style={{ ...textStyle('700'), color: colors.text, fontSize: 14 }}>URL</Text>
          <TextInput
            autoCapitalize="none"
            autoCorrect={false}
            keyboardType="url"
            onChangeText={(value) => onChangeField('originalUrl', value)}
            placeholder="링크를 붙여넣어 주세요"
            placeholderTextColor={colors.textSoft}
            style={{
              ...textStyle('400'),
              backgroundColor: colors.surface,
              borderColor: colors.border,
              borderRadius: radius.md,
              borderWidth: 1,
              color: colors.text,
              fontSize: 15,
              minHeight: 56,
              paddingHorizontal: 14,
              paddingVertical: 14,
            }}
            value={form.originalUrl}
          />
        </View>

        <View
          style={{
            alignItems: 'center',
            backgroundColor: colors.surface,
            borderColor: colors.border,
            borderRadius: radius.md,
            borderWidth: 1,
            flexDirection: 'row',
            gap: 12,
            padding: 14,
          }}
        >
          <PlatformBadge platform={form.detectedPlatform} />
          <View style={{ flex: 1, gap: 4 }}>
            <Text style={{ ...textStyle('700'), color: colors.text, fontSize: 14 }}>플랫폼 자동 감지</Text>
            <Text
              style={{
                ...textStyle('400'),
                color: form.originalUrl.trim() ? activePlatformColor.text : colors.textMuted,
                fontSize: 13,
              }}
            >
              {form.originalUrl.trim()
                ? isEnriching
                  ? `${form.detectedPlatform} 정보를 불러오는 중이에요.`
                  : `${form.detectedPlatform}로 인식했어요.`
                : 'URL을 입력하면 자동으로 감지해요.'}
            </Text>
          </View>
        </View>

        <View
          style={{
            backgroundColor: colors.surface,
            borderRadius: radius.lg,
            gap: 16,
            padding: 16,
          }}
        >
          <View style={{ gap: 10 }}>
            <Text style={{ ...textStyle('800'), color: colors.text, fontSize: 15 }}>라이브 미리보기</Text>
            {preview.embedUrl ? (
              <EmbeddedPlayer
                height={preview.detectedPlatform === 'Instagram' ? 560 : 220}
                platform={preview.detectedPlatform}
                title={previewTitle}
                url={preview.embedUrl}
              />
            ) : (
              <PreviewThumbnail
                height={180}
                platform={form.detectedPlatform}
                subtitle={preview.hostnameLabel}
                thumbnailUrl={form.thumbnailUrl}
                title={previewTitle}
              />
            )}
          </View>

          <View style={{ alignItems: 'center', flexDirection: 'row', gap: 10 }}>
            <PlatformBadge platform={form.detectedPlatform} />
            <Text style={{ ...textStyle('600'), color: activePlatformColor.text, fontSize: 13 }}>
              {preview.hostnameLabel}
            </Text>
          </View>

          {preview.summaryTemplate ? (
            <Text style={{ ...textStyle('400'), color: colors.textMuted, fontSize: 13, lineHeight: 20 }}>
              {preview.summaryTemplate}
            </Text>
          ) : null}
        </View>

        <InputField
          label="제목"
          onChangeText={(value) => onChangeField('title', value)}
          placeholder="제목을 입력해 주세요"
          value={form.title}
        />

        <View style={{ gap: 10 }}>
          <Text style={{ ...textStyle('700'), color: colors.text, fontSize: 14 }}>카테고리</Text>
          <FilterChips
            activeValue={form.category}
            onChange={(value) => onChangeField('category', value as LinkFormValues['category'])}
            options={categoryOptions}
          />
        </View>

        <InputField
          label="태그"
          onChangeText={(value) => onChangeField('tags', parseTagInput(value))}
          placeholder="예: 디자인, 인사이트, 회의"
          value={stringifyTags(form.tags)}
        />

        <InputField
          label="요약"
          multiline
          onChangeText={(value) => onChangeField('summary', value)}
          placeholder="나중에 AI 요약으로 확장할 수 있도록 짧게 정리해 두세요"
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
            backgroundColor: form.isFavorite ? colors.warningMuted : colors.surface,
            borderColor: form.isFavorite ? '#F6C86A' : colors.border,
            borderRadius: radius.md,
            borderWidth: 1,
            flexDirection: 'row',
            gap: 10,
            opacity: pressed ? 0.9 : 1,
            padding: 16,
          })}
        >
          <Ionicons
            color={form.isFavorite ? '#F59E0B' : colors.textSoft}
            name={form.isFavorite ? 'star' : 'star-outline'}
            size={20}
          />
          <View style={{ flex: 1, gap: 3 }}>
            <Text style={{ ...textStyle('700'), color: colors.text, fontSize: 14 }}>즐겨찾기로 저장</Text>
            <Text style={{ ...textStyle('400'), color: colors.textMuted, fontSize: 13 }}>
              홈과 보관함에서 바로 눈에 띄게 표시됩니다.
            </Text>
          </View>
        </Pressable>

        <AppButton disabled={disabled} label={saveLabel} onPress={onSave} />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
