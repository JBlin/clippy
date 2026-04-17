import { Ionicons } from '@expo/vector-icons';
import { Text, View } from 'react-native';

import { radius, textStyle, useThemeColors } from '@/constants/theme';
import { AppButton } from '@/components/AppButton';

interface EmptyStateProps {
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  icon?: keyof typeof Ionicons.glyphMap;
  compact?: boolean;
}

export function EmptyState({
  title,
  description,
  actionLabel,
  onAction,
  icon = 'albums-outline',
  compact = false,
}: EmptyStateProps) {
  const colors = useThemeColors();

  return (
    <View
      style={{
        alignItems: 'center',
        backgroundColor: colors.surface,
        borderColor: colors.border,
        borderRadius: radius.lg,
        borderWidth: 1,
        gap: compact ? 10 : 12,
        padding: compact ? 18 : 24,
      }}
    >
      <View
        style={{
          alignItems: 'center',
          backgroundColor: colors.accentMuted,
          borderRadius: 999,
          height: compact ? 46 : 56,
          justifyContent: 'center',
          width: compact ? 46 : 56,
        }}
      >
        <Ionicons color={colors.accent} name={icon} size={compact ? 22 : 28} />
      </View>
      <Text style={{ ...textStyle('800'), color: colors.text, fontSize: compact ? 16 : 18 }}>{title}</Text>
      <Text
        style={{
          ...textStyle('400'),
          color: colors.textMuted,
          fontSize: compact ? 13 : 14,
          lineHeight: compact ? 20 : 22,
          textAlign: 'center',
        }}
      >
        {description}
      </Text>
      {actionLabel && onAction ? (
        <AppButton compact={compact} label={actionLabel} onPress={onAction} variant="secondary" />
      ) : null}
    </View>
  );
}
