import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { ActivityIndicator, Alert, Linking, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AppButton } from '@/components/AppButton';
import { EmbeddedPlayer } from '@/components/EmbeddedPlayer';
import { EmptyState } from '@/components/EmptyState';
import { PlatformBadge } from '@/components/PlatformBadge';
import { PreviewThumbnail } from '@/components/PreviewThumbnail';
import { TagList } from '@/components/TagList';
import { colors, platformColors, radius, spacing, textStyle } from '@/constants/theme';
import { useLinkMetadata } from '@/hooks/useLinkMetadata';
import { useLinkStore } from '@/store/useLinkStore';
import { formatDateLabel, formatDateTimeLabel } from '@/utils/date';
import { getLinkEditRoute, getSingleParam } from '@/utils/routes';
import {
  getEmbeddedPlayableUrl,
  getHostnameLabel,
  getReadableUrl,
  isLikelyAutoTitle,
} from '@/utils/url';

function DetailSection({ label, value }: { label: string; value: string }) {
  if (!value) {
    return null;
  }

  return (
    <View style={{ gap: 8 }}>
      <Text style={{ ...textStyle('800'), color: colors.text, fontSize: 14 }}>{label}</Text>
      <View
        style={{
          backgroundColor: colors.surface,
          borderRadius: radius.md,
          padding: 16,
        }}
      >
        <Text style={{ ...textStyle('400'), color: colors.textMuted, fontSize: 15, lineHeight: 24 }}>{value}</Text>
      </View>
    </View>
  );
}

export default function LinkDetailScreen() {
  const { id: routeId } = useLocalSearchParams<{ id?: string | string[] }>();
  const router = useRouter();
  const isHydrated = useLinkStore((state) => state.isHydrated);
  const id = getSingleParam(routeId);
  const item = useLinkStore((state) => (id ? state.items.find((entry) => entry.id === id) : undefined));
  const deleteLink = useLinkStore((state) => state.deleteLink);
  const toggleFavorite = useLinkStore((state) => state.toggleFavorite);
  const { metadata } = useLinkMetadata(item?.originalUrl ?? '');

  if (!isHydrated || !id) {
    return (
      <SafeAreaView
        style={{
          alignItems: 'center',
          backgroundColor: colors.background,
          flex: 1,
          gap: spacing.md,
          justifyContent: 'center',
          padding: spacing.lg,
        }}
      >
        <ActivityIndicator color={colors.accent} size="large" />
        <Text style={{ ...textStyle('600'), color: colors.textMuted, fontSize: 14 }}>
          링크를 불러오는 중이에요.
        </Text>
      </SafeAreaView>
    );
  }

  if (!item) {
    return (
      <SafeAreaView style={{ backgroundColor: colors.background, flex: 1, padding: spacing.lg }}>
        <EmptyState
          actionLabel="보관함으로 이동"
          description="삭제됐거나 찾을 수 없는 링크예요."
          icon="alert-circle-outline"
          onAction={() => router.replace('/library')}
          title="링크를 찾을 수 없어요"
        />
      </SafeAreaView>
    );
  }

  const linkItem = item;
  const displayTitle =
    metadata?.title && isLikelyAutoTitle(linkItem.title, linkItem.originalUrl, linkItem.detectedPlatform)
      ? metadata.title
      : linkItem.title;
  const displayThumbnail = metadata?.thumbnailUrl || linkItem.thumbnailUrl;
  const embeddedUrl =
    metadata?.embedUrl || getEmbeddedPlayableUrl(linkItem.originalUrl, linkItem.detectedPlatform);
  const activePlatformColor = platformColors[linkItem.detectedPlatform];
  const sourceLabel = getHostnameLabel(linkItem.originalUrl);
  const shortUrl = getReadableUrl(linkItem.originalUrl, 46);

  function confirmDelete() {
    Alert.alert('삭제하기', '이 링크를 보관함에서 삭제할까요?', [
      { text: '취소', style: 'cancel' },
      {
        text: '삭제',
        style: 'destructive',
        onPress: async () => {
          try {
            await deleteLink(linkItem.id);
            Alert.alert('삭제 완료', '링크를 삭제했어요.', [
              {
                text: '확인',
                onPress: () => router.replace('/library'),
              },
            ]);
          } catch (error) {
            Alert.alert('삭제 실패', error instanceof Error ? error.message : '링크를 삭제하지 못했어요.');
          }
        },
      },
    ]);
  }

  async function handleOpenOriginal() {
    try {
      await Linking.openURL(linkItem.originalUrl);
    } catch {
      Alert.alert('열 수 없어요', '현재 기기에서 해당 링크를 열 수 없어요.');
    }
  }

  return (
    <SafeAreaView style={{ backgroundColor: colors.background, flex: 1 }}>
      <Stack.Screen options={{ title: displayTitle }} />
      <ScrollView
        contentContainerStyle={{
          gap: spacing.lg,
          padding: spacing.lg,
          paddingBottom: spacing.xxl,
        }}
        showsVerticalScrollIndicator={false}
      >
        {embeddedUrl ? (
          <EmbeddedPlayer
            height={linkItem.detectedPlatform === 'Instagram' ? 580 : 220}
            platform={linkItem.detectedPlatform}
            title={displayTitle}
            url={embeddedUrl}
          />
        ) : (
          <PreviewThumbnail
            height={220}
            platform={linkItem.detectedPlatform}
            subtitle={sourceLabel}
            thumbnailUrl={displayThumbnail}
            title={displayTitle}
          />
        )}

        <View style={{ gap: 12 }}>
          <View style={{ alignItems: 'center', flexDirection: 'row', gap: 10 }}>
            <PlatformBadge platform={linkItem.detectedPlatform} />
            <View
              style={{
                backgroundColor: colors.surfaceMuted,
                borderRadius: radius.pill,
                paddingHorizontal: 10,
                paddingVertical: 6,
              }}
            >
              <Text style={{ ...textStyle('700'), color: activePlatformColor.text, fontSize: 12 }}>
                {linkItem.category}
              </Text>
            </View>
          </View>

          <Text style={{ ...textStyle('800'), color: colors.text, fontSize: 28, lineHeight: 36 }}>
            {displayTitle}
          </Text>
          <TagList limit={8} tags={linkItem.tags} />
        </View>

        <DetailSection label="요약" value={linkItem.summary} />
        <DetailSection label="메모" value={linkItem.memo} />

        <View
          style={{
            backgroundColor: colors.surface,
            borderRadius: radius.lg,
            gap: 12,
            padding: 18,
          }}
        >
          <Text style={{ ...textStyle('800'), color: colors.text, fontSize: 14 }}>기록 정보</Text>
          <Text style={{ ...textStyle('400'), color: colors.textMuted, fontSize: 14 }}>
            출처 {sourceLabel}
          </Text>
          <Text style={{ ...textStyle('400'), color: colors.textMuted, fontSize: 14 }}>
            링크 {shortUrl}
          </Text>
          <Text style={{ ...textStyle('400'), color: colors.textMuted, fontSize: 14 }}>
            생성일 {formatDateLabel(linkItem.createdAt)}
          </Text>
          <Text style={{ ...textStyle('400'), color: colors.textMuted, fontSize: 14 }}>
            수정일 {formatDateTimeLabel(linkItem.updatedAt)}
          </Text>
        </View>

        <AppButton iconName="open-outline" label="원문 열기" onPress={handleOpenOriginal} />

        <View style={{ flexDirection: 'row', gap: 8 }}>
          <View style={{ flex: 1 }}>
            <AppButton
              compact
              iconName={linkItem.isFavorite ? 'star' : 'star-outline'}
              label={linkItem.isFavorite ? '즐겨찾기' : '즐겨찾기'}
              onPress={async () => {
                try {
                  await toggleFavorite(linkItem.id);
                } catch (error) {
                  Alert.alert(
                    '변경 실패',
                    error instanceof Error ? error.message : '즐겨찾기 상태를 변경하지 못했어요.',
                  );
                }
              }}
              variant="secondary"
            />
          </View>
          <View style={{ flex: 1 }}>
            <AppButton
              compact
              iconName="create-outline"
              label="수정하기"
              onPress={() => router.push(getLinkEditRoute(linkItem.id))}
              variant="secondary"
            />
          </View>
          <View style={{ flex: 1 }}>
            <AppButton
              compact
              iconName="trash-outline"
              label="삭제하기"
              onPress={confirmDelete}
              variant="danger"
            />
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
