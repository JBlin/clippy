import { Text, View } from 'react-native';

import { colors, radius, shadows, textStyle } from '@/constants/theme';

interface StatCardProps {
  label: string;
  value: string | number;
  helper: string;
}

export function StatCard({ label, value, helper }: StatCardProps) {
  return (
    <View
      style={{
        ...shadows.card,
        backgroundColor: colors.surface,
        borderRadius: radius.lg,
        flex: 1,
        gap: 8,
        padding: 18,
      }}
    >
      <Text style={{ ...textStyle('600'), color: colors.textMuted, fontSize: 13 }}>{label}</Text>
      <Text style={{ ...textStyle('800'), color: colors.text, fontSize: 26 }}>{value}</Text>
      <Text style={{ ...textStyle('400'), color: colors.textSoft, fontSize: 12 }}>{helper}</Text>
    </View>
  );
}
