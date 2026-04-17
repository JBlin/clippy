import { useLocalSearchParams } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import { FlatList, Pressable, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { EmptyState } from '@/components/EmptyState';
import { FilterChips, type FilterChipOption } from '@/components/FilterChips';
import { LinkCard } from '@/components/LinkCard';
import { SearchBar } from '@/components/SearchBar';
import {
  LINK_PLATFORMS,
  SORT_OPTIONS,
  type LinkCategory,
  type LinkPlatform,
  type LinkSort,
} from '@/constants/linkOptions';
import { radius, spacing, textStyle, useThemeColors } from '@/constants/theme';
import type { LinkItem } from '@/features/links/types';
import { countActiveQueryFilters } from '@/features/links/utils/linkHelpers';
import { useLinkStore } from '@/store/useLinkStore';
import { useThemeStore } from '@/store/useThemeStore';
import { applyLinkQuery } from '@/utils/linkQuery';
import { getLinkDetailRoute, getSingleParam } from '@/utils/routes';

const platformOptions: FilterChipOption<LinkPlatform | 'all'>[] = [
  { label: '전체', value: 'all' },
  ...LINK_PLATFORMS.map((platform) => ({
    label: platform,
    value: platform,
  })),
];

export default function LibraryScreen() {
  const colors = useThemeColors();
  const linkViewMode = useThemeStore((state) => state.linkViewMode);
  const params = useLocalSearchParams<{ category?: string; platform?: string; search?: string }>();
  const items = useLinkStore((state) => state.items);
  const categories = useLinkStore((state) => state.categories);
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState<LinkSort>('latest');
  const [platform, setPlatform] = useState<LinkPlatform | 'all'>('all');
  const [category, setCategory] = useState<LinkCategory | 'all'>('all');
  const [favoriteFilter, setFavoriteFilter] = useState<'all' | 'favorites'>('all');

  const categoryOptions = useMemo<FilterChipOption<LinkCategory | 'all'>[]>(
    () => [
      { label: '전체', value: 'all' },
      ...categories.map((currentCategory) => ({
        label: currentCategory,
        value: currentCategory,
      })),
    ],
    [categories],
  );

  const favoriteCount = useMemo(() => items.filter((item) => item.isFavorite).length, [items]);
  const favoriteOptions = useMemo<FilterChipOption<'all' | 'favorites'>[]>(
    () => [
      { label: `전체 ${items.length}`, value: 'all' },
      { label: `즐겨찾기 ${favoriteCount}`, value: 'favorites' },
    ],
    [favoriteCount, items.length],
  );

  function clearFilters() {
    setSearch('');
    setSort('latest');
    setPlatform('all');
    setCategory('all');
    setFavoriteFilter('all');
  }

  useEffect(() => {
    const nextCategory = getSingleParam(params.category);
    const nextPlatform = getSingleParam(params.platform);
    const nextSearch = getSingleParam(params.search)?.trim() ?? '';

    if (nextCategory && categories.includes(nextCategory)) {
      setCategory(nextCategory);
    } else if (!nextCategory) {
      setCategory('all');
    }

    if (nextPlatform && LINK_PLATFORMS.includes(nextPlatform as LinkPlatform)) {
      setPlatform(nextPlatform as LinkPlatform);
    } else if (!nextPlatform) {
      setPlatform('all');
    }

    setSearch(nextSearch);
  }, [categories, params.category, params.platform, params.search]);

  const favoritesOnly = favoriteFilter === 'favorites';
  const sortOptions = useMemo<FilterChipOption<LinkSort>[]>(
    () =>
      favoritesOnly
        ? SORT_OPTIONS.filter((option) => option.value !== 'favorites').map((option) => ({
            label: option.label,
            value: option.value,
          }))
        : SORT_OPTIONS.map((option) => ({
            label: option.label,
            value: option.value,
          })),
    [favoritesOnly],
  );

  useEffect(() => {
    if (favoritesOnly && sort === 'favorites') {
      setSort('latest');
    }
  }, [favoritesOnly, sort]);

  const filteredItems = useMemo(
    () =>
      applyLinkQuery(items, {
        category,
        favoritesOnly,
        platform,
        search,
        sort,
      }),
    [category, favoritesOnly, items, platform, search, sort],
  );

  const cardData = useMemo<(LinkItem | null)[]>(
    () => (filteredItems.length % 2 === 1 ? [...filteredItems, null] : filteredItems),
    [filteredItems],
  );

  const activeFilterCount = countActiveQueryFilters({ category, favoritesOnly, platform, search, sort });

  const listHeader = (
    <View style={{ gap: 12, paddingBottom: 14 }}>
      <View style={{ gap: 2 }}>
        <Text style={{ ...textStyle('800'), color: colors.text, fontSize: 23 }}>보관함</Text>
        <Text style={{ ...textStyle('400'), color: colors.textMuted, fontSize: 13, lineHeight: 18 }}>
          검색과 필터를 조합해서 필요한 링크를 빠르게 찾아보세요.
        </Text>
      </View>

      <SearchBar compact onChangeText={setSearch} value={search} />

      <View style={{ gap: 10 }}>
        <View style={{ gap: 8 }}>
          <Text style={{ ...textStyle('800'), color: colors.text, fontSize: 13 }}>플랫폼</Text>
          <FilterChips
            activeValue={platform}
            compact
            onChange={(value) => setPlatform(value as LinkPlatform | 'all')}
            options={platformOptions}
          />
        </View>

        <View style={{ gap: 8 }}>
          <Text style={{ ...textStyle('800'), color: colors.text, fontSize: 13 }}>카테고리</Text>
          <FilterChips
            activeValue={category}
            compact
            onChange={(value) => setCategory(value as LinkCategory | 'all')}
            options={categoryOptions}
          />
        </View>

        <View style={{ gap: 8 }}>
          <Text style={{ ...textStyle('800'), color: colors.text, fontSize: 13 }}>즐겨찾기</Text>
          <FilterChips
            activeValue={favoriteFilter}
            compact
            onChange={(value) => setFavoriteFilter(value as 'all' | 'favorites')}
            options={favoriteOptions}
          />
        </View>

        <View style={{ gap: 8 }}>
          <Text style={{ ...textStyle('800'), color: colors.text, fontSize: 13 }}>정렬</Text>
          <FilterChips
            activeValue={sort}
            compact
            onChange={(value) => setSort(value as LinkSort)}
            options={sortOptions}
          />
        </View>
      </View>

      <View style={{ alignItems: 'center', flexDirection: 'row', justifyContent: 'space-between' }}>
        <Text style={{ ...textStyle('400'), color: colors.textMuted, fontSize: 12 }}>
          결과 {filteredItems.length}개
          {activeFilterCount ? ` · 필터 ${activeFilterCount}개 적용` : ''}
        </Text>

        {activeFilterCount ? (
          <Pressable
            onPress={clearFilters}
            style={({ pressed }) => ({
              backgroundColor: colors.surface,
              borderColor: colors.border,
              borderRadius: radius.pill,
              borderWidth: 1,
              opacity: pressed ? 0.84 : 1,
              paddingHorizontal: 12,
              paddingVertical: 7,
            })}
          >
            <Text style={{ ...textStyle('700'), color: colors.accent, fontSize: 12 }}>필터 초기화</Text>
          </Pressable>
        ) : null}
      </View>
    </View>
  );

  const emptyState = (
    <EmptyState
      actionLabel="필터 초기화"
      compact
      description="검색어나 필터를 조금만 조정하면 원하는 링크를 더 쉽게 찾을 수 있어요."
      icon="search-outline"
      onAction={clearFilters}
      title="조건에 맞는 링크가 없어요"
    />
  );

  return (
    <SafeAreaView edges={['top']} style={{ backgroundColor: colors.background, flex: 1 }}>
      {linkViewMode === 'card' ? (
        <FlatList
          columnWrapperStyle={{ gap: 14 }}
          contentContainerStyle={{
            padding: spacing.md,
            paddingBottom: spacing.xxl,
          }}
          data={cardData}
          key="library-card"
          keyExtractor={(item, index) => item?.id ?? `library-spacer-${index}`}
          ListEmptyComponent={emptyState}
          ListHeaderComponent={listHeader}
          numColumns={2}
          renderItem={({ item }) =>
            item ? (
              <View style={{ flex: 1, marginBottom: 18 }}>
                <LinkCard href={getLinkDetailRoute(item.id)} item={item} variant="compact" />
              </View>
            ) : (
              <View style={{ flex: 1, marginBottom: 18 }} />
            )
          }
          showsVerticalScrollIndicator={false}
        />
      ) : (
        <FlatList
          contentContainerStyle={{
            padding: spacing.md,
            paddingBottom: spacing.xxl,
          }}
          data={filteredItems}
          key="library-list"
          keyExtractor={(item) => item.id}
          ListEmptyComponent={emptyState}
          ListHeaderComponent={listHeader}
          renderItem={({ item }) => (
            <View style={{ marginBottom: 16 }}>
              <LinkCard href={getLinkDetailRoute(item.id)} item={item} variant="list" />
            </View>
          )}
          showsVerticalScrollIndicator={false}
        />
      )}
    </SafeAreaView>
  );
}
