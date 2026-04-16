import { Link, type Href } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Pressable, Text, View, type StyleProp, type ViewStyle } from 'react-native';

import { PlatformBadge } from '@/components/PlatformBadge';
import { PreviewThumbnail } from '@/components/PreviewThumbnail';
import { colors, radius, shadows, textStyle } from '@/constants/theme';
import type { LinkItem } from '@/features/links/types';
import { getLinkCardSnippet } from '@/features/links/utils/linkHelpers';
import { formatCardDateLabel, formatDateLabel } from '@/utils/date';
import { getHostnameLabel } from '@/utils/url';

interface LinkCardProps {
  item: LinkItem;
  href?: Href;
  onPress?: () => void;
  variant?: 'default' | 'compact';
  containerStyle?: StyleProp<ViewStyle>;
}

export function LinkCard({
  item,
  href,
  onPress,
  variant = 'default',
  containerStyle,
}: LinkCardProps) {
  const compact = variant === 'compact';
  const description = getLinkCardSnippet(item);

  const card = (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        {
          ...shadows.card,
          backgroundColor: colors.surface,
          borderRadius: radius.lg,
          minHeight: compact ? 292 : undefined,
          padding: compact ? 11 : 12,
          width: compact ? '100%' : '100%',
        },
        containerStyle,
        { opacity: pressed ? 0.94 : 1 },
      ]}
    >
      <PreviewThumbnail
        aspectRatio={16 / 9}
        platform={item.detectedPlatform}
        showPlatformLabel={false}
        showTextOverlay={false}
        subtitle={getHostnameLabel(item.originalUrl)}
        thumbnailUrl={item.thumbnailUrl}
        title={item.title}
      />

      <View style={{ flex: 1, gap: compact ? 8 : 10, marginTop: compact ? 11 : 12 }}>
        <View style={{ alignItems: 'center', flexDirection: 'row', justifyContent: 'space-between' }}>
          <PlatformBadge platform={item.detectedPlatform} />
          {item.isFavorite ? <Ionicons color="#F59E0B" name="star" size={17} /> : null}
        </View>

        <Text
          numberOfLines={2}
          style={{
            ...textStyle('800'),
            color: colors.text,
            fontSize: compact ? 15 : 16,
            lineHeight: compact ? 21 : 22,
            minHeight: compact ? 42 : 44,
          }}
        >
          {item.title}
        </Text>

        <Text
          ellipsizeMode="tail"
          numberOfLines={1}
          style={{ ...textStyle('400'), color: colors.textMuted, fontSize: 13, lineHeight: 18, minHeight: 18 }}
        >
          {description}
        </Text>

        <View
          style={{
            alignItems: 'center',
            flexDirection: 'row',
            gap: 8,
            justifyContent: 'space-between',
            marginTop: 'auto',
          }}
        >
          <View
            style={{
              backgroundColor: colors.surfaceMuted,
              borderRadius: radius.pill,
              flexShrink: 1,
              paddingHorizontal: 9,
              paddingVertical: 5,
            }}
          >
            <Text numberOfLines={1} style={{ ...textStyle('700'), color: colors.textMuted, fontSize: 12 }}>
              {item.category}
            </Text>
          </View>
          <Text
            numberOfLines={1}
            style={{
              ...textStyle('400'),
              color: colors.textSoft,
              flexShrink: 0,
              fontSize: 11,
              minWidth: compact ? 54 : 74,
              textAlign: 'right',
            }}
          >
            {compact ? formatCardDateLabel(item.createdAt) : formatDateLabel(item.createdAt)}
          </Text>
        </View>
      </View>
    </Pressable>
  );

  if (!href) {
    return card;
  }

  return (
    <Link asChild href={href}>
      {card}
    </Link>
  );
}
