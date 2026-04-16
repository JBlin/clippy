import { Ionicons } from '@expo/vector-icons';
import { Text, View } from 'react-native';

import { colors, radius, textStyle } from '@/constants/theme';
import { AppButton } from '@/components/AppButton';

interface EmptyStateProps {
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  icon?: keyof typeof Ionicons.glyphMap;
}

export function EmptyState({
  title,
  description,
  actionLabel,
  onAction,
  icon = 'albums-outline',
}: EmptyStateProps) {
  return (
    <View
      style={{
        alignItems: 'center',
        backgroundColor: colors.surface,
        borderColor: colors.border,
        borderRadius: radius.lg,
        borderWidth: 1,
        gap: 12,
        padding: 24,
      }}
    >
      <View
        style={{
          alignItems: 'center',
          backgroundColor: colors.accentMuted,
          borderRadius: 999,
          height: 56,
          justifyContent: 'center',
          width: 56,
        }}
      >
        <Ionicons color={colors.accent} name={icon} size={28} />
      </View>
      <Text style={{ ...textStyle('800'), color: colors.text, fontSize: 18 }}>{title}</Text>
      <Text
        style={{
          ...textStyle('400'),
          color: colors.textMuted,
          fontSize: 14,
          lineHeight: 22,
          textAlign: 'center',
        }}
      >
        {description}
      </Text>
      {actionLabel && onAction ? <AppButton label={actionLabel} onPress={onAction} variant="secondary" /> : null}
    </View>
  );
}
