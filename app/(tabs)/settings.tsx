import type { ReactNode } from 'react';
import Constants from 'expo-constants';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';

import { FilterChips, type FilterChipOption } from '@/components/FilterChips';
import { radius, spacing, textStyle, useThemeColors, useThemePreference } from '@/constants/theme';
import { useLinkStore } from '@/store/useLinkStore';
import { useThemeStore, type LinkViewMode } from '@/store/useThemeStore';

function SettingsCard({
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
        gap: 10,
        padding: 16,
      }}
    >
      <View style={{ gap: 4 }}>
        <Text style={{ ...textStyle('800'), color: colors.text, fontSize: 16 }}>{title}</Text>
        <Text style={{ ...textStyle('400'), color: colors.textMuted, fontSize: 13, lineHeight: 20 }}>
          {description}
        </Text>
      </View>
      {children}
    </View>
  );
}

function ProviderBadge({ label }: { label: string }) {
  const colors = useThemeColors();

  return (
    <View
      style={{
        backgroundColor: colors.surfaceMuted,
        borderRadius: radius.pill,
        paddingHorizontal: 10,
        paddingVertical: 6,
      }}
    >
      <Text style={{ ...textStyle('700'), color: colors.textMuted, fontSize: 12 }}>{label}</Text>
    </View>
  );
}

function SettingsMenuRow({
  title,
  description,
  countLabel,
  onPress,
}: {
  title: string;
  description: string;
  countLabel?: string;
  onPress: () => void;
}) {
  const colors = useThemeColors();

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => ({
        alignItems: 'center',
        backgroundColor: colors.surfaceMuted,
        borderRadius: radius.md,
        flexDirection: 'row',
        gap: 12,
        opacity: pressed ? 0.9 : 1,
        paddingHorizontal: 14,
        paddingVertical: 14,
      })}
    >
      <View style={{ flex: 1, gap: 3 }}>
        <Text style={{ ...textStyle('700'), color: colors.text, fontSize: 15 }}>{title}</Text>
        <Text style={{ ...textStyle('400'), color: colors.textMuted, fontSize: 12, lineHeight: 18 }}>
          {description}
        </Text>
      </View>
      {countLabel ? (
        <Text style={{ ...textStyle('700'), color: colors.textSoft, fontSize: 12 }}>{countLabel}</Text>
      ) : null}
      <Ionicons color={colors.textSoft} name="chevron-forward-outline" size={18} />
    </Pressable>
  );
}

export default function SettingsScreen() {
  const colors = useThemeColors();
  const { colorMode, setColorMode } = useThemePreference();
  const router = useRouter();
  const categories = useLinkStore((state) => state.categories);
  const linkViewMode = useThemeStore((state) => state.linkViewMode);
  const setLinkViewMode = useThemeStore((state) => state.setLinkViewMode);
  const themeOptions: FilterChipOption<'light' | 'dark'>[] = [
    { label: '라이트', value: 'light' },
    { label: '다크', value: 'dark' },
  ];
  const viewModeOptions: FilterChipOption<LinkViewMode>[] = [
    { label: '카드형', value: 'card' },
    { label: '리스트형', value: 'list' },
  ];

  return (
    <SafeAreaView edges={['top']} style={{ backgroundColor: colors.background, flex: 1 }}>
      <ScrollView
        contentContainerStyle={{ gap: spacing.md, padding: spacing.md, paddingBottom: spacing.xxl }}
        showsVerticalScrollIndicator={false}
      >
        <View style={{ gap: 6 }}>
          <Text style={{ ...textStyle('800'), color: colors.text, fontSize: 24 }}>설정</Text>
          <Text style={{ ...textStyle('400'), color: colors.textMuted, fontSize: 14, lineHeight: 20 }}>
            Clippy 사용 환경과 보기 방식을 간단하게 정리해 보세요.
          </Text>
        </View>

        <SettingsCard
          description="지금은 게스트 모드로 사용 중이에요. 추후에는 카카오나 네이버로 로그인해서 링크를 안전하게 동기화할 수 있게 준비하고 있어요."
          title="프로필"
        >
          <View style={{ alignItems: 'center', flexDirection: 'row', gap: 12 }}>
            <View
              style={{
                alignItems: 'center',
                backgroundColor: colors.accentMuted,
                borderRadius: 999,
                height: 52,
                justifyContent: 'center',
                width: 52,
              }}
            >
              <Ionicons color={colors.accent} name="person-outline" size={22} />
            </View>
            <View style={{ flex: 1, gap: 2 }}>
              <Text style={{ ...textStyle('700'), color: colors.text, fontSize: 15 }}>게스트로 사용 중</Text>
              <Text style={{ ...textStyle('400'), color: colors.textMuted, fontSize: 13, lineHeight: 19 }}>
                로그인 기능이 추가되면 저장한 링크를 계정과 함께 관리할 수 있어요.
              </Text>
            </View>
          </View>

          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
            <ProviderBadge label="Kakao 로그인 준비 중" />
            <ProviderBadge label="Naver 로그인 준비 중" />
          </View>
        </SettingsCard>

        <SettingsCard
          description="보관함에서 링크를 카드형 또는 리스트형으로 보고, 앱 전체 테마도 함께 바꿀 수 있어요."
          title="보기 및 테마"
        >
          <View style={{ gap: 8 }}>
            <Text style={{ ...textStyle('700'), color: colors.text, fontSize: 13 }}>보기 방식</Text>
            <FilterChips
              activeValue={linkViewMode}
              compact
              onChange={(value) => setLinkViewMode(value as LinkViewMode)}
              options={viewModeOptions}
            />
          </View>

          <View style={{ gap: 8 }}>
            <Text style={{ ...textStyle('700'), color: colors.text, fontSize: 13 }}>테마</Text>
            <FilterChips
              activeValue={colorMode}
              compact
              onChange={(value) => setColorMode(value as 'light' | 'dark')}
              options={themeOptions}
            />
          </View>
        </SettingsCard>

        <SettingsCard
          description="카테고리를 추가하거나 이름을 바꾸고 순서를 조정하면 추가 화면과 보관함 필터에 바로 반영돼요."
          title="카테고리 관리"
        >
          <SettingsMenuRow
            countLabel={`${categories.length}개`}
            description="추가·수정·삭제 결과가 링크 저장 폼과 필터에 즉시 반영돼요."
            onPress={() => router.push('/settings/categories')}
            title="카테고리 편집하기"
          />
        </SettingsCard>

        <SettingsCard
          description="Clippy는 자주 다시 볼 링크를 빠르게 저장하고 정리하는 개인용 링크 저장 앱이에요."
          title="앱 정보"
        >
          <View style={{ gap: 6 }}>
            <Text style={{ ...textStyle('400'), color: colors.textMuted, fontSize: 13 }}>
              앱 버전: {Constants.expoConfig?.version ?? '1.0.0'}
            </Text>
            <Text style={{ ...textStyle('400'), color: colors.textMuted, fontSize: 13 }}>
              저장 방식: 기기 내부 로컬 저장
            </Text>
            <Text style={{ ...textStyle('400'), color: colors.textMuted, fontSize: 13 }}>
              확장 예정: 로그인 동기화, AI 요약, 자동 분류 개선
            </Text>
          </View>
        </SettingsCard>
      </ScrollView>
    </SafeAreaView>
  );
}
