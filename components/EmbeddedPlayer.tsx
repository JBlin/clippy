import { createElement } from 'react';
import { Platform, Text, View } from 'react-native';

import type { LinkPlatform } from '@/constants/linkOptions';
import { colors, radius, textStyle } from '@/constants/theme';

interface EmbeddedPlayerProps {
  height?: number;
  platform?: LinkPlatform;
  title: string;
  url: string;
}

export function EmbeddedPlayer({
  height = 220,
  platform = 'Other',
  title,
  url,
}: EmbeddedPlayerProps) {
  if (!url) {
    return null;
  }

  if (Platform.OS !== 'web') {
    return (
      <View
        style={{
          backgroundColor: colors.surface,
          borderColor: colors.border,
          borderRadius: radius.lg,
          borderWidth: 1,
          gap: 8,
          padding: 18,
        }}
      >
        <Text style={{ ...textStyle('700'), color: colors.text, fontSize: 15 }}>앱 안에서 미리보기</Text>
        <Text style={{ ...textStyle('400'), color: colors.textMuted, fontSize: 14, lineHeight: 22 }}>
          현재 MVP에서는 웹에서만 외부 콘텐츠 임베드를 바로 보여줘요.
        </Text>
      </View>
    );
  }

  const isInstagram = platform === 'Instagram';
  const frameHeight = isInstagram ? height + 240 : height;
  const offsetTop = isInstagram ? 96 : 0;

  return (
    <View
      style={{
        backgroundColor: colors.surface,
        borderColor: colors.border,
        borderRadius: radius.lg,
        borderWidth: 1,
        height,
        overflow: 'hidden',
        width: '100%',
      }}
    >
      {createElement('iframe', {
        allow:
          'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share',
        allowFullScreen: true,
        loading: 'lazy',
        referrerPolicy: 'strict-origin-when-cross-origin',
        scrolling: 'no',
        src: url,
        style: {
          border: '0',
          borderRadius: `${radius.lg}px`,
          display: 'block',
          height: `${frameHeight}px`,
          marginTop: `${-offsetTop}px`,
          width: '100%',
        },
        title,
      })}
    </View>
  );
}
