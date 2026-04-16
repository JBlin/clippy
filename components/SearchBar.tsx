import { Ionicons } from '@expo/vector-icons';
import { Pressable, TextInput, View } from 'react-native';

import { colors, radius, textStyle } from '@/constants/theme';

interface SearchBarProps {
  value: string;
  onChangeText: (text: string) => void;
  onSubmit?: () => void;
  placeholder?: string;
  compact?: boolean;
}

export function SearchBar({
  value,
  onChangeText,
  onSubmit,
  placeholder = '제목, 태그, 메모로 검색',
  compact = false,
}: SearchBarProps) {
  return (
    <View
      style={{
        alignItems: 'center',
        backgroundColor: colors.surface,
        borderColor: colors.border,
        borderRadius: radius.md,
        borderWidth: 1,
        flexDirection: 'row',
        gap: compact ? 8 : 10,
        paddingHorizontal: compact ? 12 : 14,
        paddingVertical: compact ? 2 : 6,
      }}
    >
      <Ionicons color={colors.textSoft} name="search-outline" size={compact ? 16 : 18} />
      <TextInput
        autoCapitalize="none"
        autoCorrect={false}
        onChangeText={onChangeText}
        onSubmitEditing={onSubmit}
        placeholder={placeholder}
        placeholderTextColor={colors.textSoft}
        returnKeyType="search"
        style={{
          ...textStyle('400'),
          color: colors.text,
          flex: 1,
          fontSize: compact ? 14 : 15,
          paddingVertical: compact ? 9 : 10,
        }}
        value={value}
      />
      {value ? (
        <Pressable onPress={() => onChangeText('')}>
          <Ionicons color={colors.textSoft} name="close-circle" size={compact ? 16 : 18} />
        </Pressable>
      ) : null}
    </View>
  );
}
