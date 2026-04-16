import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';

import { EmptyState } from '@/components/EmptyState';
import { colors } from '@/constants/theme';

export default function NotFoundScreen() {
  const router = useRouter();

  return (
    <SafeAreaView style={{ backgroundColor: colors.background, flex: 1, padding: 20 }}>
      <EmptyState
        actionLabel="홈으로 이동"
        description="요청한 화면을 찾을 수 없어요. 저장된 링크 목록으로 돌아가 다시 확인해 주세요."
        icon="compass-outline"
        onAction={() => router.replace('/')}
        title="페이지를 찾을 수 없어요"
      />
    </SafeAreaView>
  );
}
