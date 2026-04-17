import { Ionicons } from '@expo/vector-icons';
import { Link, type Href } from 'expo-router';
import { Pressable, Text, View, type StyleProp, type ViewStyle } from 'react-native';

import { PlatformBadge } from '@/components/PlatformBadge';
import { PreviewThumbnail } from '@/components/PreviewThumbnail';
import { radius, shadows, textStyle, useThemeColors, type AppColors } from '@/constants/theme';
import type { LinkItem } from '@/features/links/types';
import { getLinkCardTagsText } from '@/features/links/utils/linkHelpers';
import { useLinkMetadata } from '@/hooks/useLinkMetadata';
import { formatDateLabel } from '@/utils/date';
import { getHostnameLabel, isLikelyAutoSummary, isLikelyAutoTitle } from '@/utils/url';

interface LinkCardProps {
  item: LinkItem;
  href?: Href;
  onPress?: () => void;
  variant?: 'default' | 'compact' | 'list';
  containerStyle?: StyleProp<ViewStyle>;
}

function resolveCardContent(item: LinkItem, metadata?: { title?: string; description?: string; sourceLabel?: string }) {
  const baseSourceLabel = getHostnameLabel(item.originalUrl);
  const sourceLabel = metadata?.sourceLabel?.trim() || baseSourceLabel;
  const title =
    metadata?.title && isLikelyAutoTitle(item.title, item.originalUrl, item.detectedPlatform)
      ? metadata.title
      : item.title;
  const description =
    (metadata?.description?.trim() && isLikelyAutoSummary(item.summary, item.detectedPlatform)
      ? metadata.description.trim()
      : item.summary.trim()) ||
    metadata?.description?.trim() ||
    item.memo.trim() ||
    `${sourceLabel} 링크`;

  return {
    description,
    sourceLabel,
    title,
  };
}

function MetaChip({
  label,
  colors,
  compact = false,
}: {
  label: string;
  colors: AppColors;
  compact?: boolean;
}) {
  return (
    <View
      style={{
        alignSelf: 'flex-start',
        backgroundColor: colors.surfaceMuted,
        borderRadius: radius.pill,
        maxWidth: '100%',
        paddingHorizontal: compact ? 8 : 10,
        paddingVertical: compact ? 4 : 5,
      }}
    >
      <Text
        numberOfLines={1}
        style={{ ...textStyle('700'), color: colors.textMuted, fontSize: compact ? 11 : 12 }}
      >
        {label}
      </Text>
    </View>
  );
}

export function LinkCard({
  item,
  href,
  onPress,
  variant = 'default',
  containerStyle,
}: LinkCardProps) {
  const colors = useThemeColors();
  const compact = variant === 'compact';
  const list = variant === 'list';
  const badgeIsSmall = compact || list;
  const tagsText = getLinkCardTagsText(item, list ? 18 : compact ? 20 : 24);
  const { metadata } = useLinkMetadata(item.originalUrl, {
    debounceMs: list ? 80 : compact ? 120 : 180,
    enabled: Boolean(item.originalUrl),
  });
  const displayThumbnail = metadata?.thumbnailUrl || item.thumbnailUrl;
  const { description, sourceLabel, title } = resolveCardContent(item, metadata ?? undefined);
  const supportingText = tagsText ? `${sourceLabel} · ${tagsText}` : sourceLabel;
  const dateLabel = formatDateLabel(item.createdAt);

  const body = list ? (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        {
          ...shadows.card,
          backgroundColor: colors.surface,
          borderRadius: radius.lg,
          padding: 13,
          width: '100%',
        },
        containerStyle,
        { opacity: pressed ? 0.94 : 1 },
      ]}
    >
      <View style={{ alignItems: 'flex-start', flexDirection: 'row', gap: 12 }}>
        <View style={{ width: 112 }}>
          <PreviewThumbnail
            aspectRatio={4 / 3}
            platform={item.detectedPlatform}
            showPlatformLabel={false}
            showTextOverlay={false}
            sourceUrl={item.originalUrl}
            subtitle={sourceLabel}
            thumbnailUrl={displayThumbnail}
            title={title}
          />
        </View>

        <View style={{ flex: 1, gap: 7, minHeight: 88 }}>
          <View
            style={{
              alignItems: 'center',
              flexDirection: 'row',
              gap: 6,
              justifyContent: 'space-between',
              minHeight: 24,
            }}
          >
            <View style={{ flex: 1, flexDirection: 'row', flexWrap: 'wrap', gap: 6 }}>
              <PlatformBadge platform={item.detectedPlatform} size="small" />
              <MetaChip colors={colors} compact label={item.category} />
            </View>
            {item.isFavorite ? <Ionicons color="#F59E0B" name="star" size={15} /> : null}
          </View>

          <Text
            numberOfLines={2}
            style={{
              ...textStyle('800'),
              color: colors.text,
              fontSize: 15,
              lineHeight: 21,
              minHeight: 42,
            }}
          >
            {title}
          </Text>

          <Text
            ellipsizeMode="tail"
            numberOfLines={2}
            style={{ ...textStyle('400'), color: colors.textMuted, fontSize: 12, lineHeight: 17, minHeight: 34 }}
          >
            {description}
          </Text>

          <View style={{ gap: 6, marginTop: 'auto' }}>
            <Text
              ellipsizeMode="tail"
              numberOfLines={1}
              style={{ ...textStyle('600'), color: colors.textSoft, fontSize: 11, lineHeight: 15 }}
            >
              {supportingText}
            </Text>
            <Text
              numberOfLines={1}
              style={{ ...textStyle('400'), color: colors.textSoft, fontSize: 11, lineHeight: 16 }}
            >
              {dateLabel}
            </Text>
          </View>
        </View>
      </View>
    </Pressable>
  ) : (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        {
          ...shadows.card,
          backgroundColor: colors.surface,
          borderRadius: radius.lg,
          minHeight: compact ? 316 : 336,
          padding: compact ? 12 : 14,
          width: '100%',
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
        sourceUrl={item.originalUrl}
        subtitle={sourceLabel}
        thumbnailUrl={displayThumbnail}
        title={title}
      />

      <View style={{ flex: 1, gap: compact ? 8 : 10, marginTop: compact ? 16 : 15 }}>
        <View
          style={{
            alignItems: 'center',
            flexDirection: 'row',
            gap: 6,
            justifyContent: 'space-between',
            minHeight: 24,
          }}
        >
          <View style={{ flex: 1, flexDirection: 'row', flexWrap: 'wrap', gap: 6 }}>
            <PlatformBadge platform={item.detectedPlatform} size={badgeIsSmall ? 'small' : 'default'} />
            <MetaChip colors={colors} compact={badgeIsSmall} label={item.category} />
          </View>
          {item.isFavorite ? <Ionicons color="#F59E0B" name="star" size={badgeIsSmall ? 15 : 17} /> : null}
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
          {title}
        </Text>

        <Text
          ellipsizeMode="tail"
          numberOfLines={2}
          style={{
            ...textStyle('400'),
            color: colors.textMuted,
            fontSize: compact ? 12 : 13,
            lineHeight: compact ? 17 : 18,
            minHeight: compact ? 34 : 36,
          }}
        >
          {description}
        </Text>

        <View style={{ gap: 6, marginTop: 'auto' }}>
          <Text
            ellipsizeMode="tail"
            numberOfLines={1}
            style={{
              ...textStyle('600'),
              color: colors.textSoft,
              fontSize: 11,
              lineHeight: 15,
              minHeight: 15,
            }}
          >
            {supportingText}
          </Text>
          <Text
            numberOfLines={1}
            style={{
              ...textStyle('400'),
              color: colors.textSoft,
              fontSize: 11,
              lineHeight: 16,
              textAlign: 'left',
            }}
          >
            {dateLabel}
          </Text>
        </View>
      </View>
    </Pressable>
  );

  if (!href) {
    return body;
  }

  return (
    <Link asChild href={href}>
      {body}
    </Link>
  );
}
