import { useEffect, useState } from 'react';
import { Image, Text, View } from 'react-native';

import { colors, platformColors, radius, textStyle } from '@/constants/theme';
import type { LinkPlatform } from '@/constants/linkOptions';
import { getPlatformInitials } from '@/utils/url';

interface PreviewThumbnailProps {
  platform: LinkPlatform;
  thumbnailUrl?: string;
  title: string;
  subtitle?: string;
  height?: number;
}

export function PreviewThumbnail({
  platform,
  thumbnailUrl,
  title,
  subtitle,
  height = 116,
}: PreviewThumbnailProps) {
  const [hasError, setHasError] = useState(false);
  const badgeColors = platformColors[platform];

  useEffect(() => {
    setHasError(false);
  }, [thumbnailUrl]);

  return (
    <View
      style={{
        height,
        overflow: 'hidden',
        borderRadius: radius.md,
        backgroundColor: badgeColors.background,
        borderWidth: 1,
        borderColor: badgeColors.border,
      }}
      >
      {thumbnailUrl && !hasError ? (
        <View style={{ flex: 1 }}>
          <Image
            source={{ uri: thumbnailUrl }}
            resizeMode="cover"
            style={{ height: '100%', width: '100%' }}
            onError={() => setHasError(true)}
          />
          <View
            style={{
              backgroundColor: 'rgba(20, 32, 43, 0.48)',
              bottom: 0,
              left: 0,
              padding: 14,
              position: 'absolute',
              right: 0,
            }}
          >
            <Text numberOfLines={1} style={{ ...textStyle('800'), color: colors.surface, fontSize: 14 }}>
              {title}
            </Text>
            {subtitle ? (
              <Text numberOfLines={1} style={{ ...textStyle('400'), color: 'rgba(255,255,255,0.82)', fontSize: 12, marginTop: 4 }}>
                {subtitle}
              </Text>
            ) : null}
          </View>
        </View>
      ) : (
        <View
          style={{
            flex: 1,
            justifyContent: 'space-between',
            padding: 16,
          }}
        >
          <View
            style={{
              backgroundColor: 'rgba(255,255,255,0.38)',
              borderRadius: 999,
              height: height * 0.7,
              position: 'absolute',
              right: -height * 0.18,
              top: -height * 0.18,
              width: height * 0.7,
            }}
          />
          <View
            style={{
              backgroundColor: 'rgba(255,255,255,0.22)',
              borderRadius: 999,
              bottom: -height * 0.28,
              height: height * 0.82,
              position: 'absolute',
              right: -height * 0.05,
              width: height * 0.82,
            }}
          />
          <View
            style={{
              alignSelf: 'flex-start',
              borderRadius: 999,
              backgroundColor: badgeColors.text,
              paddingHorizontal: 10,
              paddingVertical: 5,
            }}
          >
            <Text style={{ ...textStyle('700'), color: colors.surface, fontSize: 12 }}>{platform}</Text>
          </View>

          <View style={{ gap: 4 }}>
            <Text style={{ ...textStyle('800'), color: badgeColors.text, fontSize: 36 }}>
              {getPlatformInitials(platform)}
            </Text>
            <Text
              numberOfLines={2}
              style={{ ...textStyle('800'), color: badgeColors.text, fontSize: 15, lineHeight: 20 }}
            >
              {title}
            </Text>
            {subtitle ? (
              <Text
                numberOfLines={1}
                style={{ ...textStyle('400'), color: badgeColors.text, fontSize: 12, opacity: 0.78 }}
              >
                {subtitle}
              </Text>
            ) : null}
          </View>
        </View>
      )}
    </View>
  );
}
