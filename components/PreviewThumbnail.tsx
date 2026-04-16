import { useEffect, useState } from 'react';
import { Image, Text, View } from 'react-native';

import type { LinkPlatform } from '@/constants/linkOptions';
import { colors, platformColors, radius, textStyle } from '@/constants/theme';
import { getPlatformInitials } from '@/utils/url';

interface PreviewThumbnailProps {
  platform: LinkPlatform;
  thumbnailUrl?: string;
  title: string;
  subtitle?: string;
  height?: number;
  aspectRatio?: number;
  showPlatformLabel?: boolean;
  showTextOverlay?: boolean;
}

export function PreviewThumbnail({
  platform,
  thumbnailUrl,
  title,
  subtitle,
  height = 116,
  aspectRatio,
  showPlatformLabel = true,
  showTextOverlay = true,
}: PreviewThumbnailProps) {
  const [hasError, setHasError] = useState(false);
  const badgeColors = platformColors[platform];
  const placeholderTitle = showTextOverlay ? title : `${platform} 링크`;

  useEffect(() => {
    setHasError(false);
  }, [thumbnailUrl]);

  return (
    <View
      style={{
        backgroundColor: badgeColors.background,
        borderColor: badgeColors.border,
        borderRadius: radius.md,
        borderWidth: 1,
        height: aspectRatio ? undefined : height,
        overflow: 'hidden',
        width: '100%',
        ...(aspectRatio ? { aspectRatio } : null),
      }}
    >
      {thumbnailUrl && !hasError ? (
        <View style={{ flex: 1 }}>
          <Image
            onError={() => setHasError(true)}
            resizeMode="cover"
            source={{ uri: thumbnailUrl }}
            style={{ height: '100%', width: '100%' }}
          />
          {showTextOverlay ? (
            <View
              style={{
                backgroundColor: 'rgba(20, 32, 43, 0.5)',
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
                <Text
                  numberOfLines={1}
                  style={{
                    ...textStyle('400'),
                    color: 'rgba(255,255,255,0.82)',
                    fontSize: 12,
                    marginTop: 4,
                  }}
                >
                  {subtitle}
                </Text>
              ) : null}
            </View>
          ) : null}
        </View>
      ) : (
        <View
          style={{
            flex: 1,
            justifyContent: 'space-between',
            padding: 14,
          }}
        >
          <View
            style={{
              backgroundColor: 'rgba(255,255,255,0.32)',
              borderRadius: 999,
              height: height * 0.72,
              position: 'absolute',
              right: -height * 0.18,
              top: -height * 0.18,
              width: height * 0.72,
            }}
          />
          <View
            style={{
              backgroundColor: 'rgba(255,255,255,0.18)',
              borderRadius: 999,
              bottom: -height * 0.3,
              height: height * 0.9,
              position: 'absolute',
              right: -height * 0.06,
              width: height * 0.9,
            }}
          />

          <View style={{ alignItems: 'flex-start', flexDirection: 'row', justifyContent: 'space-between' }}>
            {showPlatformLabel ? (
              <View
                style={{
                  alignSelf: 'flex-start',
                  backgroundColor: badgeColors.text,
                  borderRadius: radius.pill,
                  paddingHorizontal: 10,
                  paddingVertical: 5,
                }}
              >
                <Text style={{ ...textStyle('700'), color: colors.surface, fontSize: 12 }}>{platform}</Text>
              </View>
            ) : (
              <View />
            )}

            <View
              style={{
                alignItems: 'center',
                backgroundColor: 'rgba(255,255,255,0.6)',
                borderRadius: 12,
                height: 36,
                justifyContent: 'center',
                width: 36,
              }}
            >
              <Text style={{ ...textStyle('800'), color: badgeColors.text, fontSize: 13 }}>
                {getPlatformInitials(platform)}
              </Text>
            </View>
          </View>

          <View
            style={{
              backgroundColor: 'rgba(255,255,255,0.56)',
              borderRadius: radius.md,
              gap: 7,
              paddingHorizontal: 12,
              paddingVertical: 10,
            }}
          >
            <View style={{ gap: 4 }}>
              <Text
                numberOfLines={showTextOverlay ? 2 : 1}
                style={{ ...textStyle('800'), color: badgeColors.text, fontSize: 14, lineHeight: 18 }}
              >
                {placeholderTitle}
              </Text>
              <Text
                numberOfLines={1}
                style={{ ...textStyle('400'), color: badgeColors.text, fontSize: 12, opacity: 0.82 }}
              >
                {subtitle || '미리보기 이미지를 준비하는 중이에요'}
              </Text>
            </View>

            <View style={{ flexDirection: 'row', gap: 6 }}>
              <View
                style={{
                  backgroundColor: 'rgba(255,255,255,0.76)',
                  borderRadius: radius.pill,
                  height: 6,
                  width: '46%',
                }}
              />
              <View
                style={{
                  backgroundColor: 'rgba(255,255,255,0.56)',
                  borderRadius: radius.pill,
                  height: 6,
                  width: '22%',
                }}
              />
            </View>
          </View>
        </View>
      )}
    </View>
  );
}
