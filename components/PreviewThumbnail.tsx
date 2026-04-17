import { Ionicons } from '@expo/vector-icons';
import { useEffect, useState } from 'react';
import { Image, Text, View } from 'react-native';

import type { LinkPlatform } from '@/constants/linkOptions';
import { platformColors, radius, textStyle, useThemeColors } from '@/constants/theme';
import { safeParseUrl } from '@/utils/url';

interface PreviewThumbnailProps {
  platform: LinkPlatform;
  thumbnailUrl?: string;
  sourceUrl?: string;
  title: string;
  subtitle?: string;
  height?: number;
  aspectRatio?: number;
  showPlatformLabel?: boolean;
  showTextOverlay?: boolean;
}

function isSiteIconThumbnail(url?: string) {
  if (!url) {
    return false;
  }

  return url.includes('google.com/s2/favicons');
}

export function PreviewThumbnail({
  platform,
  thumbnailUrl,
  sourceUrl,
  title,
  subtitle,
  height = 116,
  aspectRatio,
  showPlatformLabel = true,
  showTextOverlay = true,
}: PreviewThumbnailProps) {
  const colors = useThemeColors();
  const [hasError, setHasError] = useState(false);
  const badgeColors = platformColors[platform];
  const hostname = safeParseUrl(sourceUrl ?? '')?.hostname.replace(/^www\./, '').toLowerCase() ?? '';
  const isNaverHost = hostname.includes('naver.com');
  const hasSiteIconThumbnail = isSiteIconThumbnail(thumbnailUrl);
  const fallbackIconName = (() => {
    if (isNaverHost) {
      return null;
    }

    switch (platform) {
      case 'YouTube':
        return 'logo-youtube';
      case 'Instagram':
        return 'logo-instagram';
      case 'X':
        return 'logo-twitter';
      case 'TikTok':
        return 'logo-tiktok';
      case 'Blog':
        return 'document-text-outline';
      case 'News':
        return 'newspaper-outline';
      case 'Shopping':
        return 'bag-handle-outline';
      case 'Other':
      default:
        return 'globe-outline';
    }
  })() as keyof typeof Ionicons.glyphMap | null;

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
        hasSiteIconThumbnail ? (
          <View
            style={{
              flex: 1,
              justifyContent: 'center',
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

            {showPlatformLabel ? (
              <View
                style={{
                  left: 14,
                  position: 'absolute',
                  top: 14,
                }}
              >
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
              </View>
            ) : null}

            <View style={{ alignItems: 'center', justifyContent: 'center' }}>
              <View
                style={{
                  alignItems: 'center',
                  backgroundColor: 'rgba(255,255,255,0.78)',
                  borderColor: 'rgba(255,255,255,0.24)',
                  borderRadius: 20,
                  borderWidth: 1,
                  height: 76,
                  justifyContent: 'center',
                  width: 76,
                }}
              >
                <Image
                  onError={() => setHasError(true)}
                  resizeMode="contain"
                  source={{ uri: thumbnailUrl }}
                  style={{ height: 40, width: 40 }}
                />
              </View>
            </View>

            {showTextOverlay ? (
              <View
                style={{
                  alignSelf: 'center',
                  backgroundColor: 'rgba(255,255,255,0.56)',
                  borderRadius: radius.pill,
                  bottom: 14,
                  maxWidth: '86%',
                  paddingHorizontal: 10,
                  paddingVertical: 5,
                  position: 'absolute',
                }}
              >
                <Text
                  numberOfLines={1}
                  style={{ ...textStyle('700'), color: badgeColors.text, fontSize: 11, lineHeight: 14 }}
                >
                  {subtitle || title}
                </Text>
              </View>
            ) : null}
          </View>
        ) : (
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
        )
      ) : (
        <View
          style={{
            flex: 1,
            justifyContent: 'center',
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

          {showPlatformLabel ? (
            <View
              style={{
                left: 14,
                position: 'absolute',
                top: 14,
              }}
            >
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
            </View>
          ) : null}

          <View style={{ alignItems: 'center', justifyContent: 'center' }}>
            <View
              style={{
                alignItems: 'center',
                backgroundColor: 'rgba(255,255,255,0.72)',
                borderColor: 'rgba(255,255,255,0.2)',
                borderRadius: 20,
                borderWidth: 1,
                height: 72,
                justifyContent: 'center',
                width: 72,
              }}
            >
              {isNaverHost ? (
                <View
                  style={{
                    alignItems: 'center',
                    backgroundColor: '#03C75A',
                    borderRadius: 16,
                    height: 38,
                    justifyContent: 'center',
                    width: 38,
                  }}
                >
                  <Text style={{ ...textStyle('800'), color: '#FFFFFF', fontSize: 20, lineHeight: 22 }}>N</Text>
                </View>
              ) : fallbackIconName ? (
                <Ionicons color={badgeColors.text} name={fallbackIconName} size={30} />
              ) : (
                <View />
              )}
            </View>
          </View>

          {subtitle && showPlatformLabel ? (
            <View
              style={{
                alignSelf: 'center',
                backgroundColor: 'rgba(255,255,255,0.54)',
                borderRadius: radius.pill,
                bottom: 14,
                paddingHorizontal: 10,
                paddingVertical: 5,
                position: 'absolute',
              }}
            >
              <View
                style={{ alignItems: 'center', flexDirection: 'row', gap: 6, justifyContent: 'center' }}
              >
                {isNaverHost ? (
                  <View
                    style={{
                      alignItems: 'center',
                      backgroundColor: '#03C75A',
                      borderRadius: 999,
                      height: 16,
                      justifyContent: 'center',
                      width: 16,
                    }}
                  >
                    <Text style={{ ...textStyle('800'), color: '#FFFFFF', fontSize: 9, lineHeight: 10 }}>N</Text>
                  </View>
                ) : fallbackIconName ? (
                  <Ionicons color={badgeColors.text} name={fallbackIconName} size={12} />
                ) : null}
                <Text
                  numberOfLines={1}
                  style={{ ...textStyle('700'), color: badgeColors.text, fontSize: 11, lineHeight: 14 }}
                >
                  {subtitle}
                </Text>
              </View>
            </View>
          ) : null}
        </View>
      )}
    </View>
  );
}
