import { Alert } from 'react-native';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
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
  const categories = useLinkStore((state) => state.categories);
  const item = useLinkStore((state) => (id ? state.items.find((entry) => entry.id === id) : undefined));
  const updateLink = useLinkStore((state) => state.updateLink);
  const { form, isEnriching, preview, updateField } = useLinkFormState(categories, item);
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

  const linkItem = item;

  async function handleSave() {
    if (validationMessage) {
      Alert.alert('입력 내용을 확인해 주세요', validationMessage);
      return;
    }

    try {
      await updateLink(linkItem.id, form);
      Alert.alert('수정 완료', '링크 내용을 업데이트했어요.', [
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
        categories={categories}
        defaultShowAdditional
        disabled={Boolean(validationMessage)}
        form={form}
        isEnriching={isEnriching}
        mode="edit"
        onChangeField={updateField}
        onSave={handleSave}
        preview={preview}
        saveLabel="수정하기"
      />
    </SafeAreaView>
  );
}
