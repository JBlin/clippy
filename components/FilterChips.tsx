import { Pressable, ScrollView, Text, View } from 'react-native';

import { radius, spacing, textStyle, useThemeColors } from '@/constants/theme';

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
  const colors = useThemeColors();

  return (
    <ScrollView
      alwaysBounceHorizontal={false}
      contentContainerStyle={{
        alignItems: 'center',
        paddingHorizontal: spacing.xs / 2,
        paddingRight: spacing.xs,
      }}
      decelerationRate="fast"
      directionalLockEnabled
      horizontal
      keyboardShouldPersistTaps="handled"
      overScrollMode="never"
      nestedScrollEnabled
      showsHorizontalScrollIndicator={false}
      style={{ flexGrow: 0, marginHorizontal: -(spacing.xs / 2) }}
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
