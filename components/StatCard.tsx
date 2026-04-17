import { Text, View } from 'react-native';

import { radius, shadows, textStyle, useThemeColors } from '@/constants/theme';

interface StatCardProps {
  label: string;
  value: string | number;
  helper: string;
  compact?: boolean;
}

export function StatCard({ label, value, helper, compact = false }: StatCardProps) {
  const colors = useThemeColors();

  return (
    <View
      style={{
        ...shadows.card,
        backgroundColor: colors.surface,
        borderRadius: radius.lg,
        flex: 1,
        gap: compact ? 4 : 8,
        padding: compact ? 14 : 18,
      }}
    >
      <Text style={{ ...textStyle('600'), color: colors.textMuted, fontSize: compact ? 12 : 13 }}>
        {label}
      </Text>
      <Text style={{ ...textStyle('800'), color: colors.text, fontSize: compact ? 21 : 26 }}>{value}</Text>
      <Text style={{ ...textStyle('400'), color: colors.textSoft, fontSize: compact ? 11 : 12 }}>
        {helper}
      </Text>
    </View>
  );
}
