import { useMemo, useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AppButton } from '@/components/AppButton';
import { EmptyState } from '@/components/EmptyState';
import { FilterChips, type FilterChipOption } from '@/components/FilterChips';
import { LinkCard } from '@/components/LinkCard';
import { SearchBar } from '@/components/SearchBar';
import { StatCard } from '@/components/StatCard';
import { LINK_PLATFORMS, type LinkPlatform } from '@/constants/linkOptions';
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
  const categories = useLinkStore((state) => state.categories);
  const [search, setSearch] = useState('');
  const [selectedPlatform, setSelectedPlatform] = useState<LinkPlatform | 'all'>('all');

  function handleSearchSubmit() {
    const trimmedSearch = search.trim();

    router.push({
      pathname: '/library',
      params: trimmedSearch ? { search: trimmedSearch } : {},
    });
  }

  const recentItems = useMemo(
    () => applyLinkQuery(items, { platform: selectedPlatform, sort: 'latest' }).slice(0, 4),
    [items, selectedPlatform],
  );

  const favoriteCount = items.filter((item) => item.isFavorite).length;
  const todayCount = items.filter((item) => isToday(item.createdAt)).length;

  return (
    <SafeAreaView edges={['top']} style={{ backgroundColor: colors.background, flex: 1 }}>
      <ScrollView
        contentContainerStyle={{
          padding: spacing.md,
          paddingBottom: spacing.xxl,
        }}
        showsVerticalScrollIndicator={false}
      >
        <View
          style={{
            alignSelf: 'center',
            gap: 28,
            maxWidth: 760,
            width: '100%',
          }}
        >
          <View style={{ gap: 10 }}>
            <Text style={{ ...textStyle('700'), color: colors.textSoft, fontSize: 13 }}>Clippy</Text>
            <Text style={{ ...textStyle('800'), color: colors.text, fontSize: 24, lineHeight: 31 }}>
              링크를 가볍게 모아보세요
            </Text>
            <Text style={{ ...textStyle('400'), color: colors.textMuted, fontSize: 14, lineHeight: 20 }}>
              자주 다시 볼 링크를 빠르게 저장하고, 필요한 순간에 바로 찾아보세요.
            </Text>
          </View>

          <View style={{ gap: 10 }}>
            <SearchBar
              compact
              onChangeText={setSearch}
              onSubmit={handleSearchSubmit}
              placeholder="제목이나 메모로 저장한 링크를 찾아보세요"
              value={search}
            />
            <View style={{ flexDirection: 'row', gap: 10 }}>
              <View style={{ flex: 1 }}>
                <AppButton label="링크 추가" onPress={() => router.push('/add')} />
              </View>
              <View style={{ flex: 1 }}>
                <AppButton label="보관함 보기" onPress={() => router.push('/library')} variant="secondary" />
              </View>
            </View>
          </View>

          <View style={{ flexDirection: 'row', gap: 10 }}>
            <StatCard compact helper="저장됨" label="전체" value={items.length} />
            <StatCard compact helper="중요" label="즐겨찾기" value={favoriteCount} />
            <StatCard compact helper="오늘" label="추가" value={todayCount} />
          </View>

          <View style={{ gap: 12 }}>
            <Text style={{ ...textStyle('800'), color: colors.text, fontSize: 16 }}>플랫폼 빠른 필터</Text>
            <FilterChips
              activeValue={selectedPlatform}
              compact
              onChange={(value) => setSelectedPlatform(value as LinkPlatform | 'all')}
              options={platformOptions}
            />
          </View>

          <View style={{ gap: 12 }}>
            <View style={{ alignItems: 'center', flexDirection: 'row', justifyContent: 'space-between' }}>
              <Text style={{ ...textStyle('800'), color: colors.text, fontSize: 17 }}>최근 저장한 링크</Text>
              <Pressable onPress={() => router.push('/library')}>
                <Text style={{ ...textStyle('700'), color: colors.accent, fontSize: 13 }}>전체 보기</Text>
              </Pressable>
            </View>

            {recentItems.length ? (
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 12, justifyContent: 'space-between' }}>
                {recentItems.map((item) => (
                  <View key={item.id} style={{ width: '48.25%' }}>
                    <LinkCard
                      containerStyle={{ width: '100%' }}
                      href={getLinkDetailRoute(item.id)}
                      item={item}
                      variant="compact"
                    />
                  </View>
                ))}
              </View>
            ) : (
              <EmptyState
                actionLabel="링크 추가"
                compact
                description="첫 링크를 저장하면 최근 저장 영역에서 바로 확인할 수 있어요."
                icon="link-outline"
                onAction={() => router.push('/add')}
                title="아직 저장한 링크가 없어요"
              />
            )}
          </View>

          <View style={{ gap: 12 }}>
            <Text style={{ ...textStyle('800'), color: colors.text, fontSize: 16 }}>카테고리 바로가기</Text>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 12, justifyContent: 'space-between' }}>
              {categories.map((category) => {
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
                    <Text style={{ ...textStyle('800'), color: colors.text, fontSize: 15 }}>{category}</Text>
                    <Text style={{ ...textStyle('400'), color: colors.textMuted, fontSize: 12, marginTop: 6 }}>
                      {count}개의 링크
                    </Text>
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
