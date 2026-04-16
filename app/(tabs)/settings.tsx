import type { ReactNode } from 'react';
import Constants from 'expo-constants';
import { Alert, Text, View } from 'react-native';
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
        gap: 12,
        padding: 18,
      }}
    >
      <View style={{ gap: 6 }}>
        <Text style={{ ...textStyle('800'), color: colors.text, fontSize: 17 }}>{title}</Text>
        <Text style={{ ...textStyle('400'), color: colors.textMuted, fontSize: 14, lineHeight: 22 }}>{description}</Text>
      </View>
      {children}
    </View>
  );
}

export default function SettingsScreen() {
  const items = useLinkStore((state) => state.items);
  const resetAllData = useLinkStore((state) => state.resetAllData);
  const seedDemoData = useLinkStore((state) => state.seedDemoData);

  function confirmSeed() {
    Alert.alert('데모 데이터 불러오기', '현재 데이터를 데모 링크 8개로 교체할까요?', [
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
    Alert.alert('전체 데이터 초기화', '저장한 모든 링크를 삭제할까요? 이 작업은 되돌릴 수 없어요.', [
      { text: '취소', style: 'cancel' },
      {
        text: '삭제',
        style: 'destructive',
        onPress: async () => {
          try {
            await resetAllData();
            Alert.alert('완료', '저장된 링크를 모두 초기화했어요.');
          } catch (error) {
            Alert.alert('초기화 실패', error instanceof Error ? error.message : '데이터를 초기화하지 못했어요.');
          }
        },
      },
    ]);
  }

  return (
    <SafeAreaView edges={['top']} style={{ backgroundColor: colors.background, flex: 1 }}>
      <View style={{ gap: spacing.lg, padding: spacing.lg }}>
        <View style={{ gap: 8 }}>
          <Text style={{ ...textStyle('800'), color: colors.text, fontSize: 28 }}>설정</Text>
          <Text style={{ ...textStyle('400'), color: colors.textMuted, fontSize: 15, lineHeight: 22 }}>
            로컬 저장 데이터 관리와 앱 정보를 확인할 수 있어요.
          </Text>
        </View>

        <SettingsCard
          description={`현재 ${items.length}개의 링크가 이 기기에만 저장되어 있어요.`}
          title="데이터 관리"
        >
          <AppButton label="데모 데이터 넣기" onPress={confirmSeed} variant="secondary" />
          <AppButton label="전체 초기화" onPress={confirmReset} variant="danger" />
        </SettingsCard>

        <SettingsCard
          description="로그인과 백엔드 없이 AsyncStorage만 사용하도록 설계된 모바일 MVP입니다."
          title="Clippy 정보"
        >
          <View style={{ gap: 8 }}>
            <Text style={{ ...textStyle('400'), color: colors.textMuted, fontSize: 14 }}>앱 버전: {Constants.expoConfig?.version ?? '1.0.0'}</Text>
            <Text style={{ ...textStyle('400'), color: colors.textMuted, fontSize: 14 }}>타깃: Expo Router + TypeScript + AsyncStorage</Text>
            <Text style={{ ...textStyle('400'), color: colors.textMuted, fontSize: 14 }}>
              확장 포인트: `features/links/services`, `store/useLinkStore.ts`
            </Text>
          </View>
        </SettingsCard>
      </View>
    </SafeAreaView>
  );
}
