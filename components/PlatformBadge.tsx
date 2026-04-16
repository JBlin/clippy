import { Text, View } from 'react-native';

import { platformColors, textStyle } from '@/constants/theme';
import type { LinkPlatform } from '@/constants/linkOptions';

interface PlatformBadgeProps {
  platform: LinkPlatform;
}

export function PlatformBadge({ platform }: PlatformBadgeProps) {
  const colors = platformColors[platform];

  return (
    <View
      style={{
        backgroundColor: colors.background,
        borderColor: colors.border,
        borderRadius: 999,
        borderWidth: 1,
        paddingHorizontal: 10,
        paddingVertical: 5,
      }}
    >
      <Text
        style={{
          ...textStyle('700'),
          color: colors.text,
          fontSize: 12,
        }}
      >
        {platform}
      </Text>
    </View>
  );
}
