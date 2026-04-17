import { useMemo, useState } from 'react';
import { Alert, Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Stack } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AppButton } from '@/components/AppButton';
import { radius, spacing, textStyle, useThemeColors } from '@/constants/theme';
import { useLinkStore } from '@/store/useLinkStore';

function IconActionButton({
  icon,
  onPress,
  disabled = false,
  tone = 'default',
}: {
  icon: keyof typeof Ionicons.glyphMap;
  onPress: () => void;
  disabled?: boolean;
  tone?: 'default' | 'danger';
}) {
  const colors = useThemeColors();

  return (
    <Pressable
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => ({
        alignItems: 'center',
        backgroundColor: tone === 'danger' ? colors.dangerMuted : colors.surfaceMuted,
        borderRadius: radius.md,
        height: 36,
        justifyContent: 'center',
        opacity: disabled ? 0.35 : pressed ? 0.82 : 1,
        width: 36,
      })}
    >
      <Ionicons color={tone === 'danger' ? colors.danger : colors.textSoft} name={icon} size={16} />
    </Pressable>
  );
}

export default function CategoryManagementScreen() {
  const colors = useThemeColors();
  const categories = useLinkStore((state) => state.categories);
  const items = useLinkStore((state) => state.items);
  const addCategory = useLinkStore((state) => state.addCategory);
  const updateCategory = useLinkStore((state) => state.updateCategory);
  const deleteCategory = useLinkStore((state) => state.deleteCategory);
  const reorderCategories = useLinkStore((state) => state.reorderCategories);
  const [newCategory, setNewCategory] = useState('');
  const [editingCategory, setEditingCategory] = useState<string | null>(null);
  const [editingValue, setEditingValue] = useState('');

  const itemCountByCategory = useMemo(
    () =>
      categories.reduce<Record<string, number>>((acc, category) => {
        acc[category] = items.filter((item) => item.category === category).length;
        return acc;
      }, {}),
    [categories, items],
  );

  async function handleAddCategory() {
    try {
      await addCategory(newCategory);
      setNewCategory('');
    } catch (error) {
      Alert.alert('카테고리 추가 실패', error instanceof Error ? error.message : '카테고리를 추가하지 못했어요.');
    }
  }

  function startEditing(category: string) {
    setEditingCategory(category);
    setEditingValue(category);
  }

  async function handleSaveEdit() {
    if (!editingCategory) {
      return;
    }

    try {
      await updateCategory(editingCategory, editingValue);
      setEditingCategory(null);
      setEditingValue('');
    } catch (error) {
      Alert.alert('카테고리 수정 실패', error instanceof Error ? error.message : '카테고리를 수정하지 못했어요.');
    }
  }

  function handleMoveCategory(category: string, direction: 'up' | 'down') {
    const currentIndex = categories.indexOf(category);
    const targetIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;

    if (currentIndex < 0 || targetIndex < 0 || targetIndex >= categories.length) {
      return;
    }

    const nextCategories = [...categories];
    [nextCategories[currentIndex], nextCategories[targetIndex]] = [
      nextCategories[targetIndex],
      nextCategories[currentIndex],
    ];

    reorderCategories(nextCategories).catch((error) => {
      Alert.alert('순서 변경 실패', error instanceof Error ? error.message : '카테고리 순서를 바꾸지 못했어요.');
    });
  }

  function confirmDeleteCategory(category: string) {
    const fallbackCategory = categories.find((currentCategory) => currentCategory !== category) ?? '기타';

    Alert.alert(
      '카테고리 삭제',
      `"${category}"를 삭제하면 해당 링크는 "${fallbackCategory}"로 이동해요.`,
      [
        { text: '취소', style: 'cancel' },
        {
          text: '삭제',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteCategory(category);
              if (editingCategory === category) {
                setEditingCategory(null);
                setEditingValue('');
              }
            } catch (error) {
              Alert.alert(
                '카테고리 삭제 실패',
                error instanceof Error ? error.message : '카테고리를 삭제하지 못했어요.',
              );
            }
          },
        },
      ],
    );
  }

  return (
    <SafeAreaView edges={['bottom']} style={{ backgroundColor: colors.background, flex: 1 }}>
      <Stack.Screen options={{ title: '카테고리 관리' }} />
      <ScrollView
        contentContainerStyle={{ gap: spacing.md, padding: spacing.md, paddingBottom: spacing.xxl }}
        showsVerticalScrollIndicator={false}
      >
        <View
          style={{
            backgroundColor: colors.surface,
            borderRadius: radius.lg,
            gap: 10,
            padding: 16,
          }}
        >
          <Text style={{ ...textStyle('800'), color: colors.text, fontSize: 16 }}>카테고리 추가</Text>
          <Text style={{ ...textStyle('400'), color: colors.textMuted, fontSize: 13, lineHeight: 19 }}>
            추가한 카테고리는 링크 저장 화면과 보관함 필터에 바로 반영돼요.
          </Text>
          <TextInput
            onChangeText={setNewCategory}
            placeholder="새 카테고리 이름"
            placeholderTextColor={colors.textSoft}
            style={{
              ...textStyle('400'),
              backgroundColor: colors.surface,
              borderColor: colors.border,
              borderRadius: radius.md,
              borderWidth: 1,
              color: colors.text,
              fontSize: 14,
              paddingHorizontal: 12,
              paddingVertical: 12,
            }}
            value={newCategory}
          />
          <AppButton compact label="카테고리 추가" onPress={handleAddCategory} />
        </View>

        <View style={{ gap: 10 }}>
          <Text style={{ ...textStyle('800'), color: colors.text, fontSize: 16 }}>
            현재 카테고리 {categories.length}개
          </Text>

          {categories.map((category, index) => {
            const isEditing = editingCategory === category;
            const count = itemCountByCategory[category] ?? 0;

            return (
              <View
                key={category}
                style={{
                  backgroundColor: colors.surface,
                  borderRadius: radius.lg,
                  gap: 10,
                  padding: 14,
                }}
              >
                {isEditing ? (
                  <>
                    <TextInput
                      autoFocus
                      onChangeText={setEditingValue}
                      placeholder="카테고리 이름"
                      placeholderTextColor={colors.textSoft}
                      style={{
                        ...textStyle('400'),
                        backgroundColor: colors.surface,
                        borderColor: colors.border,
                        borderRadius: radius.md,
                        borderWidth: 1,
                        color: colors.text,
                        fontSize: 14,
                        paddingHorizontal: 12,
                        paddingVertical: 12,
                      }}
                      value={editingValue}
                    />
                    <View style={{ flexDirection: 'row', gap: 10 }}>
                      <View style={{ flex: 1 }}>
                        <AppButton compact label="저장" onPress={handleSaveEdit} />
                      </View>
                      <View style={{ flex: 1 }}>
                        <AppButton
                          compact
                          label="취소"
                          onPress={() => {
                            setEditingCategory(null);
                            setEditingValue('');
                          }}
                          variant="secondary"
                        />
                      </View>
                    </View>
                  </>
                ) : (
                  <View style={{ alignItems: 'center', flexDirection: 'row', gap: 12 }}>
                    <View style={{ flex: 1, gap: 4 }}>
                      <Text style={{ ...textStyle('700'), color: colors.text, fontSize: 15 }}>{category}</Text>
                      <Text style={{ ...textStyle('400'), color: colors.textMuted, fontSize: 12 }}>
                        {count}개의 링크
                      </Text>
                    </View>

                    <View style={{ flexDirection: 'row', gap: 8 }}>
                      <IconActionButton
                        disabled={index === 0}
                        icon="chevron-up-outline"
                        onPress={() => handleMoveCategory(category, 'up')}
                      />
                      <IconActionButton
                        disabled={index === categories.length - 1}
                        icon="chevron-down-outline"
                        onPress={() => handleMoveCategory(category, 'down')}
                      />
                      <IconActionButton icon="create-outline" onPress={() => startEditing(category)} />
                      <IconActionButton
                        icon="trash-outline"
                        onPress={() => confirmDeleteCategory(category)}
                        tone="danger"
                      />
                    </View>
                  </View>
                )}
              </View>
            );
          })}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
