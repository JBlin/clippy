import { ScrollView, Text, View, Pressable } from 'react-native';
import { useMemo, useState } from 'react';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';

import { EmptyState } from '@/components/EmptyState';
import { FilterChips, type FilterChipOption } from '@/components/FilterChips';
import { LinkCard } from '@/components/LinkCard';
import { StatCard } from '@/components/StatCard';
import { LINK_CATEGORIES, LINK_PLATFORMS, type LinkPlatform } from '@/constants/linkOptions';
import { colors, radius, spacing, textStyle } from '@/constants/theme';
import { useLinkStore } from '@/store/useLinkStore';
import { isToday } from '@/utils/date';
import { applyLinkQuery } from '@/utils/linkQuery';
import { getLinkDetailRoute } from '@/utils/routes';

const platformOptions: FilterChipOption<LinkPlatform | 'all'>[] = [
  { label: '전체', value: 'all' },
  ...LINK_PLATFORMS.map((platform) => ({
    label: platform,
    value: platform,
  })),
];

export default function HomeScreen() {
  const router = useRouter();
  const items = useLinkStore((state) => state.items);
  const [selectedPlatform, setSelectedPlatform] = useState<LinkPlatform | 'all'>('all');

  const recentItems = useMemo(
    () => applyLinkQuery(items, { platform: selectedPlatform, sort: 'latest' }).slice(0, 5),
    [items, selectedPlatform],
  );

  const favoriteCount = items.filter((item) => item.isFavorite).length;
  const todayCount = items.filter((item) => isToday(item.createdAt)).length;

  return (
    <SafeAreaView edges={['top']} style={{ backgroundColor: colors.background, flex: 1 }}>
      <ScrollView
        contentContainerStyle={{
          padding: spacing.lg,
          paddingBottom: spacing.xxl,
        }}
        showsVerticalScrollIndicator={false}
      >
        <View
          style={{
            alignSelf: 'center',
            gap: spacing.xl,
            maxWidth: 760,
            width: '100%',
          }}
        >
          <View style={{ gap: 10 }}>
            <Text style={{ ...textStyle('700'), color: colors.textSoft, fontSize: 13 }}>Clippy</Text>
            <Text style={{ ...textStyle('800'), color: colors.text, fontSize: 30, lineHeight: 38 }}>
              흩어진 링크를{'\n'}한 곳에 모아보세요
            </Text>
            <Text style={{ ...textStyle('400'), color: colors.textMuted, fontSize: 15, lineHeight: 24 }}>
              YouTube, Instagram, 블로그, 뉴스, 쇼핑 링크를 모바일에서 빠르게 저장하고 다시 찾을 수 있어요.
            </Text>
          </View>

          <View style={{ flexDirection: 'row', gap: 12 }}>
            <StatCard helper="현재 저장된 전체 링크" label="전체 링크" value={items.length} />
            <StatCard helper="중요하게 표시한 링크" label="즐겨찾기" value={favoriteCount} />
          </View>

          <View
            style={{
              backgroundColor: colors.surface,
              borderRadius: radius.lg,
              gap: 6,
              padding: 18,
            }}
          >
            <Text style={{ ...textStyle('600'), color: colors.textMuted, fontSize: 13 }}>오늘 저장</Text>
            <Text style={{ ...textStyle('800'), color: colors.text, fontSize: 28 }}>{todayCount}</Text>
            <Text style={{ ...textStyle('400'), color: colors.textSoft, fontSize: 13 }}>오늘 새로 추가한 링크 수예요.</Text>
          </View>

          <View style={{ gap: 12 }}>
            <Text style={{ ...textStyle('800'), color: colors.text, fontSize: 18 }}>플랫폼 빠른 필터</Text>
            <FilterChips
              activeValue={selectedPlatform}
              onChange={(value) => setSelectedPlatform(value as LinkPlatform | 'all')}
              options={platformOptions}
            />
          </View>

          <View style={{ gap: 14 }}>
            <View style={{ alignItems: 'center', flexDirection: 'row', justifyContent: 'space-between' }}>
              <Text style={{ ...textStyle('800'), color: colors.text, fontSize: 18 }}>최근 저장한 링크</Text>
              <Pressable onPress={() => router.push('/library')}>
                <Text style={{ ...textStyle('700'), color: colors.accent, fontSize: 13 }}>보관함 전체 보기</Text>
              </Pressable>
            </View>

            {recentItems.length ? (
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <View style={{ flexDirection: 'row', gap: 14 }}>
                  {recentItems.map((item) => (
                    <LinkCard
                      href={getLinkDetailRoute(item.id)}
                      item={item}
                      key={item.id}
                      variant="compact"
                    />
                  ))}
                </View>
              </ScrollView>
            ) : (
              <EmptyState
                actionLabel="링크 추가"
                description="첫 링크를 저장하면 최근 저장 목록과 추천 카테고리가 여기에 나타나요."
                icon="link-outline"
                onAction={() => router.push('/add')}
                title="아직 저장한 링크가 없어요"
              />
            )}
          </View>

          <View style={{ gap: 14 }}>
            <Text style={{ ...textStyle('800'), color: colors.text, fontSize: 18 }}>카테고리</Text>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 12, justifyContent: 'space-between' }}>
              {LINK_CATEGORIES.map((category) => {
                const count = items.filter((item) => item.category === category).length;

                return (
                  <Pressable
                    key={category}
                    onPress={() => router.push({ pathname: '/library', params: { category } })}
                    style={({ pressed }) => ({
                      backgroundColor: colors.surface,
                      borderRadius: radius.lg,
                      opacity: pressed ? 0.92 : 1,
                      padding: 16,
                      width: '48%',
                    })}
                  >
                    <Text style={{ ...textStyle('800'), color: colors.text, fontSize: 16 }}>{category}</Text>
                    <Text style={{ ...textStyle('400'), color: colors.textMuted, fontSize: 13, marginTop: 8 }}>{count}개의 링크</Text>
                  </Pressable>
                );
              })}
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
