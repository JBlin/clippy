import { Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useThemeColors } from '@/constants/theme';
import { LinkEditorForm } from '@/features/links/components/LinkEditorForm';
import { validateLinkForm } from '@/features/links/utils/linkHelpers';
import { useLinkFormState } from '@/hooks/useLinkFormState';
import { useLinkStore } from '@/store/useLinkStore';

export default function AddScreen() {
  const router = useRouter();
  const colors = useThemeColors();
  const categories = useLinkStore((state) => state.categories);
  const addLink = useLinkStore((state) => state.addLink);
  const { form, isEnriching, preview, resetForm, updateField } = useLinkFormState(categories);
  const validationMessage = validateLinkForm(form);

  async function handleSave() {
    if (validationMessage) {
      Alert.alert('입력 내용을 확인해 주세요', validationMessage);
      return;
    }

    try {
      await addLink(form);
      resetForm();
      router.replace('/library');
    } catch (error) {
      Alert.alert('저장 실패', error instanceof Error ? error.message : '로컬 저장 중 문제가 발생했어요.');
    }
  }

  return (
    <SafeAreaView edges={['top']} style={{ backgroundColor: colors.background, flex: 1 }}>
      <LinkEditorForm
        categories={categories}
        defaultShowAdditional={false}
        disabled={Boolean(validationMessage)}
        form={form}
        isEnriching={isEnriching}
        mode="create"
        onChangeField={updateField}
        onSave={handleSave}
        preview={preview}
        saveLabel="저장하기"
      />
    </SafeAreaView>
  );
}
