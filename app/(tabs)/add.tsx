import { Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';

import { LinkEditorForm } from '@/features/links/components/LinkEditorForm';
import { colors } from '@/constants/theme';
import { validateLinkForm } from '@/features/links/utils/linkHelpers';
import { useLinkFormState } from '@/hooks/useLinkFormState';
import { useLinkStore } from '@/store/useLinkStore';

export default function AddScreen() {
  const router = useRouter();
  const addLink = useLinkStore((state) => state.addLink);
  const { form, isEnriching, preview, resetForm, updateField } = useLinkFormState();
  const validationMessage = validateLinkForm(form);

  async function handleSave() {
    if (validationMessage) {
      Alert.alert('입력을 확인해 주세요', validationMessage);
      return;
    }

    try {
      await addLink(form);
      resetForm();
      Alert.alert('저장 완료', '링크를 저장했고 보관함으로 이동할게요.', [
        {
          text: '확인',
          onPress: () => router.replace('/library'),
        },
      ]);
    } catch (error) {
      Alert.alert('저장 실패', error instanceof Error ? error.message : '로컬 저장 중 문제가 발생했어요.');
    }
  }

  return (
    <SafeAreaView edges={['top']} style={{ backgroundColor: colors.background, flex: 1 }}>
      <LinkEditorForm
        disabled={Boolean(validationMessage)}
        form={form}
        isEnriching={isEnriching}
        onChangeField={updateField}
        onSave={handleSave}
        preview={preview}
        saveLabel="저장하기"
      />
    </SafeAreaView>
  );
}
