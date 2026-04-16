import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { EmptyState } from '@/components/EmptyState';
import { colors, spacing } from '@/constants/theme';
import { LinkEditorForm } from '@/features/links/components/LinkEditorForm';
import { validateLinkForm } from '@/features/links/utils/linkHelpers';
import { useLinkFormState } from '@/hooks/useLinkFormState';
import { useLinkStore } from '@/store/useLinkStore';
import { getSingleParam } from '@/utils/routes';

export default function EditLinkScreen() {
  const { id: routeId } = useLocalSearchParams<{ id?: string | string[] }>();
  const router = useRouter();
  const id = getSingleParam(routeId);
  const item = useLinkStore((state) => (id ? state.items.find((entry) => entry.id === id) : undefined));
  const updateLink = useLinkStore((state) => state.updateLink);
  const { form, isEnriching, preview, updateField } = useLinkFormState(item);
  const validationMessage = validateLinkForm(form);

  if (!item) {
    return (
      <SafeAreaView style={{ backgroundColor: colors.background, flex: 1, padding: spacing.lg }}>
        <EmptyState
          actionLabel="보관함으로 이동"
          description="수정하려는 링크를 찾을 수 없어요."
          icon="create-outline"
          onAction={() => router.replace('/library')}
          title="링크를 찾을 수 없어요"
        />
      </SafeAreaView>
    );
  }

  async function handleSave() {
    if (validationMessage) {
      Alert.alert('입력을 확인해 주세요', validationMessage);
      return;
    }

    try {
      await updateLink(item.id, form);
      Alert.alert('수정 완료', '링크 내용이 업데이트되었어요.', [
        {
          text: '확인',
          onPress: () => router.back(),
        },
      ]);
    } catch (error) {
      Alert.alert('수정 실패', error instanceof Error ? error.message : '링크를 수정하지 못했어요.');
    }
  }

  return (
    <SafeAreaView style={{ backgroundColor: colors.background, flex: 1 }}>
      <Stack.Screen options={{ title: '링크 수정' }} />
      <LinkEditorForm
        disabled={Boolean(validationMessage)}
        form={form}
        isEnriching={isEnriching}
        onChangeField={updateField}
        onSave={handleSave}
        preview={preview}
        saveLabel="수정하기"
      />
    </SafeAreaView>
  );
}
