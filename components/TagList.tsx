import { Text, View } from 'react-native';

import { radius, textStyle, useThemeColors } from '@/constants/theme';

interface TagListProps {
  tags: string[];
  limit?: number;
}

export function TagList({ tags, limit = 3 }: TagListProps) {
  const colors = useThemeColors();
  const visibleTags = tags.slice(0, limit);

  if (!visibleTags.length) {
    return null;
  }

  return (
    <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
      {visibleTags.map((tag) => (
        <View
          key={tag}
          style={{
            backgroundColor: colors.surfaceMuted,
            borderRadius: radius.pill,
            paddingHorizontal: 10,
            paddingVertical: 5,
          }}
        >
          <Text style={{ ...textStyle('600'), color: colors.textMuted, fontSize: 12 }}>#{tag}</Text>
        </View>
      ))}
    </View>
  );
}
