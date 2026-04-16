import { Pressable, ScrollView, Text, View } from 'react-native';

import { colors, radius, textStyle } from '@/constants/theme';

export interface FilterChipOption<T extends string = string> {
  label: string;
  value: T;
}

interface FilterChipsProps<T extends string> {
  options: FilterChipOption<T>[];
  activeValue: T;
  onChange: (value: T) => void;
  compact?: boolean;
}

export function FilterChips<T extends string>({
  options,
  activeValue,
  onChange,
  compact = false,
}: FilterChipsProps<T>) {
  return (
    <ScrollView
      contentContainerStyle={{ paddingRight: 4 }}
      horizontal
      showsHorizontalScrollIndicator={false}
    >
      <View style={{ flexDirection: 'row', gap: 8 }}>
        {options.map((option) => {
          const isActive = option.value === activeValue;

          return (
            <Pressable
              key={option.value}
              onPress={() => onChange(option.value)}
              style={({ pressed }) => ({
                backgroundColor: isActive ? colors.accent : colors.surface,
                borderColor: isActive ? colors.accent : colors.border,
                borderRadius: radius.pill,
                borderWidth: 1,
                opacity: pressed ? 0.88 : 1,
                paddingHorizontal: compact ? 12 : 14,
                paddingVertical: compact ? 8 : 10,
              })}
            >
              <Text
                style={{
                  ...textStyle('700'),
                  color: isActive ? colors.surface : colors.textMuted,
                  fontSize: compact ? 12 : 13,
                }}
              >
                {option.label}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </ScrollView>
  );
}
