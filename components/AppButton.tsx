import { Ionicons } from '@expo/vector-icons';
import { Pressable, Text, View } from 'react-native';

import { colors, radius, textStyle } from '@/constants/theme';

interface AppButtonProps {
  label: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  disabled?: boolean;
  compact?: boolean;
  iconName?: keyof typeof Ionicons.glyphMap;
}

export function AppButton({
  label,
  onPress,
  variant = 'primary',
  disabled = false,
  compact = false,
  iconName,
}: AppButtonProps) {
  const styleMap = {
    primary: {
      backgroundColor: colors.accent,
      borderColor: colors.accent,
      color: colors.surface,
    },
    secondary: {
      backgroundColor: colors.surface,
      borderColor: colors.border,
      color: colors.text,
    },
    danger: {
      backgroundColor: colors.danger,
      borderColor: colors.danger,
      color: colors.surface,
    },
    ghost: {
      backgroundColor: 'transparent',
      borderColor: 'transparent',
      color: colors.textMuted,
    },
  } as const;

  const current = styleMap[variant];
  const iconColor = disabled ? colors.textSoft : current.color;

  return (
    <Pressable
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => ({
        alignItems: 'center',
        backgroundColor: disabled ? colors.border : current.backgroundColor,
        borderColor: current.borderColor,
        borderRadius: radius.md,
        borderWidth: 1,
        justifyContent: 'center',
        opacity: pressed ? 0.88 : 1,
        paddingHorizontal: compact ? 12 : 16,
        paddingVertical: compact ? 10 : 14,
      })}
    >
      <View style={{ alignItems: 'center', flexDirection: 'row', gap: iconName ? 6 : 0 }}>
        {iconName ? <Ionicons color={iconColor} name={iconName} size={compact ? 15 : 16} /> : null}
        <Text
          style={{
            ...textStyle('700'),
            color: disabled ? colors.textSoft : current.color,
            fontSize: compact ? 13 : 15,
          }}
        >
          {label}
        </Text>
      </View>
    </Pressable>
  );
}
