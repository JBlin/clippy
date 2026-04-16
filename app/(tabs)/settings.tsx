import type { ReactNode } from 'react';
import Constants from 'expo-constants';
import { Alert, Pressable, ScrollView, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AppButton } from '@/components/AppButton';
import { colors, radius, spacing, textStyle } from '@/constants/theme';
import { useLinkStore } from '@/store/useLinkStore';

function SettingsCard({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: ReactNode;
}) {
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
  const router = useRouter();
  const items = useLinkStore((state) => state.items);
  const categories = useLinkStore((state) => state.categories);
  const resetAllData = useLinkStore((state) => state.resetAllData);
  const seedDemoData = useLinkStore((state) => state.seedDemoData);

  function confirmSeed() {
    Alert.alert('데모 데이터 불러오기', '현재 저장된 링크를 데모 링크 8개로 바꿀까요?', [
      { text: '취소', style: 'cancel' },
      {
        text: '불러오기',
        style: 'default',
        onPress: async () => {
          try {
            await seedDemoData();
            Alert.alert('완료', '데모 데이터 8개를 불러왔어요.');
          } catch (error) {
            Alert.alert('불러오기 실패', error instanceof Error ? error.message : '데모 데이터를 불러오지 못했어요.');
          }
        },
      },
    ]);
  }

  function confirmReset() {
    Alert.alert('전체 초기화', '저장한 링크와 카테고리 변경 내용을 모두 초기화할까요?', [
      { text: '취소', style: 'cancel' },
      {
        text: '초기화',
        style: 'destructive',
        onPress: async () => {
          try {
            await resetAllData();
            Alert.alert('완료', '링크와 카테고리를 기본 상태로 되돌렸어요.');
          } catch (error) {
            Alert.alert('초기화 실패', error instanceof Error ? error.message : '데이터를 초기화하지 못했어요.');
          }
        },
      },
    ]);
  }

  return (
    <SafeAreaView edges={['top']} style={{ backgroundColor: colors.background, flex: 1 }}>
      <ScrollView
        contentContainerStyle={{ gap: spacing.md, padding: spacing.md, paddingBottom: spacing.xxl }}
        showsVerticalScrollIndicator={false}
      >
        <View style={{ gap: 6 }}>
          <Text style={{ ...textStyle('800'), color: colors.text, fontSize: 24 }}>설정</Text>
          <Text style={{ ...textStyle('400'), color: colors.textMuted, fontSize: 14, lineHeight: 20 }}>
            Clippy 사용 환경과 보관 방식을 깔끔하게 정리해 보세요.
          </Text>
        </View>

        <SettingsCard
          description="지금은 게스트 모드로 사용 중이에요. 나중에는 카카오나 네이버로 로그인해 링크를 안전하게 동기화할 수 있게 준비하고 있어요."
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
          description="카테고리를 추가하거나 이름을 바꾸고, 순서도 원하는 흐름에 맞게 정리할 수 있어요."
          title="카테고리 관리"
        >
          <SettingsMenuRow
            countLabel={`${categories.length}개`}
            description="홈, 추가 화면, 보관함 필터에 바로 반영돼요."
            onPress={() => router.push('/settings/categories')}
            title="카테고리 편집하기"
          />
        </SettingsCard>

        <SettingsCard
          description={`현재 ${items.length}개의 링크가 이 기기에만 저장되어 있어요. 필요하면 데모 데이터로 바꾸거나 모두 초기화할 수 있어요.`}
          title="데이터"
        >
          <AppButton compact label="데모 데이터 넣기" onPress={confirmSeed} variant="secondary" />
          <AppButton compact label="전체 초기화" onPress={confirmReset} variant="danger" />
        </SettingsCard>

        <SettingsCard
          description="Clippy는 자주 다시 볼 링크를 빠르게 저장하고 정리하는 개인용 링크 지갑이에요."
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
              이후 확장: 로그인, 클라우드 동기화, AI 요약
            </Text>
          </View>
        </SettingsCard>
      </ScrollView>
    </SafeAreaView>
  );
}
