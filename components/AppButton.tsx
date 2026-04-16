import { Pressable, Text } from 'react-native';

import { colors, radius, textStyle } from '@/constants/theme';

interface AppButtonProps {
  label: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  disabled?: boolean;
}

export function AppButton({
  label,
  onPress,
  variant = 'primary',
  disabled = false,
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

  return (
    <Pressable
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => ({
        alignItems: 'center',
        borderRadius: radius.md,
        borderWidth: 1,
        borderColor: current.borderColor,
        backgroundColor: disabled ? colors.border : current.backgroundColor,
        opacity: pressed ? 0.88 : 1,
        paddingHorizontal: 16,
        paddingVertical: 14,
      })}
    >
      <Text style={{ ...textStyle('700'), color: disabled ? colors.textSoft : current.color, fontSize: 15 }}>
        {label}
      </Text>
    </Pressable>
  );
}
