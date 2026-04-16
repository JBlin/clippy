import { Ionicons } from '@expo/vector-icons';
import { Pressable, TextInput, View } from 'react-native';

import { colors, radius, textStyle } from '@/constants/theme';

interface SearchBarProps {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
}

export function SearchBar({
  value,
  onChangeText,
  placeholder = '제목, 태그, 메모로 검색',
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
        gap: 10,
        paddingHorizontal: 14,
        paddingVertical: 6,
      }}
    >
      <Ionicons color={colors.textSoft} name="search-outline" size={18} />
      <TextInput
        autoCapitalize="none"
        autoCorrect={false}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={colors.textSoft}
        style={{
          ...textStyle('400'),
          color: colors.text,
          flex: 1,
          fontSize: 15,
          paddingVertical: 10,
        }}
        value={value}
      />
      {value ? (
        <Pressable onPress={() => onChangeText('')}>
          <Ionicons color={colors.textSoft} name="close-circle" size={18} />
        </Pressable>
      ) : null}
    </View>
  );
}
