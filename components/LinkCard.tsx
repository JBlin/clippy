import { Link, type Href } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Pressable, Text, View } from 'react-native';

import { PlatformBadge } from '@/components/PlatformBadge';
import { PreviewThumbnail } from '@/components/PreviewThumbnail';
import { TagList } from '@/components/TagList';
import { colors, radius, shadows, textStyle } from '@/constants/theme';
import type { LinkItem } from '@/features/links/types';
import { getLinkCardSnippet } from '@/features/links/utils/linkHelpers';
import { formatDateLabel } from '@/utils/date';
import { getHostnameLabel } from '@/utils/url';

interface LinkCardProps {
  item: LinkItem;
  href?: Href;
  onPress?: () => void;
  variant?: 'default' | 'compact';
}

export function LinkCard({ item, href, onPress, variant = 'default' }: LinkCardProps) {
  const compact = variant === 'compact';
  const subtitle = getHostnameLabel(item.originalUrl);
  const description = getLinkCardSnippet(item);

  const card = (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => ({
        ...shadows.card,
        backgroundColor: colors.surface,
        borderRadius: radius.lg,
        gap: 14,
        opacity: pressed ? 0.94 : 1,
        padding: 14,
        width: compact ? 286 : '100%',
      })}
    >
      <PreviewThumbnail
        height={compact ? 130 : 124}
        platform={item.detectedPlatform}
        subtitle={subtitle}
        thumbnailUrl={item.thumbnailUrl}
        title={item.title}
      />

      <View style={{ gap: 10, marginTop: compact ? 6 : 4 }}>
        <View style={{ alignItems: 'center', flexDirection: 'row', justifyContent: 'space-between' }}>
          <PlatformBadge platform={item.detectedPlatform} />
          {item.isFavorite ? <Ionicons color="#F59E0B" name="star" size={18} /> : null}
        </View>

        <View style={{ gap: 7 }}>
          <Text numberOfLines={2} style={{ ...textStyle('800'), color: colors.text, fontSize: 17 }}>
            {item.title}
          </Text>
          <Text numberOfLines={1} style={{ ...textStyle('600'), color: colors.textSoft, fontSize: 12 }}>
            {subtitle}
          </Text>
          <Text
            ellipsizeMode="tail"
            numberOfLines={2}
            style={{ ...textStyle('400'), color: colors.textMuted, fontSize: 14, lineHeight: 21 }}
          >
            {description}
          </Text>
        </View>

        <TagList tags={item.tags} />

        <View style={{ alignItems: 'center', flexDirection: 'row', justifyContent: 'space-between' }}>
          <View
            style={{
              backgroundColor: colors.surfaceMuted,
              borderRadius: radius.pill,
              paddingHorizontal: 10,
              paddingVertical: 6,
            }}
          >
            <Text style={{ ...textStyle('700'), color: colors.textMuted, fontSize: 12 }}>{item.category}</Text>
          </View>
          <Text style={{ ...textStyle('400'), color: colors.textSoft, fontSize: 12 }}>{formatDateLabel(item.createdAt)}</Text>
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
