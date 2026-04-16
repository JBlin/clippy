import { useLocalSearchParams } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import { FlatList, Pressable, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
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
import { colors, radius, spacing, textStyle } from '@/constants/theme';
import { countActiveQueryFilters } from '@/features/links/utils/linkHelpers';
import { useLinkStore } from '@/store/useLinkStore';
import { applyLinkQuery } from '@/utils/linkQuery';
import { getLinkDetailRoute, getSingleParam } from '@/utils/routes';

const platformOptions: FilterChipOption<LinkPlatform | 'all'>[] = [
  { label: '전체', value: 'all' },
  ...LINK_PLATFORMS.map((platform) => ({
    label: platform,
    value: platform,
  })),
];

const favoriteOptions: FilterChipOption<'all' | 'favorites'>[] = [
  { label: '전체', value: 'all' },
  { label: '즐겨찾기만', value: 'favorites' },
];

function getNextSort(currentSort: LinkSort) {
  const currentIndex = SORT_OPTIONS.findIndex((option) => option.value === currentSort);
  const nextIndex = currentIndex >= SORT_OPTIONS.length - 1 ? 0 : currentIndex + 1;

  return SORT_OPTIONS[nextIndex]?.value ?? 'latest';
}

export default function LibraryScreen() {
  const params = useLocalSearchParams<{ category?: string; platform?: string; search?: string }>();
  const items = useLinkStore((state) => state.items);
  const categories = useLinkStore((state) => state.categories);
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState<LinkSort>('latest');
  const [platform, setPlatform] = useState<LinkPlatform | 'all'>('all');
  const [category, setCategory] = useState<LinkCategory | 'all'>('all');
  const [favoriteFilter, setFavoriteFilter] = useState<'all' | 'favorites'>('all');
  const [showFilters, setShowFilters] = useState(false);

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
  const activeFilterCount = countActiveQueryFilters({ category, favoritesOnly, platform, search, sort });
  const currentSortLabel = SORT_OPTIONS.find((option) => option.value === sort)?.label ?? '최신순';

  useEffect(() => {
    if (activeFilterCount > 0) {
      setShowFilters(true);
    }
  }, [activeFilterCount]);

  return (
    <SafeAreaView edges={['top']} style={{ backgroundColor: colors.background, flex: 1 }}>
      <FlatList
        contentContainerStyle={{
          padding: spacing.md,
          paddingBottom: spacing.xxl,
        }}
        data={filteredItems}
        ItemSeparatorComponent={() => <View style={{ height: 14 }} />}
        keyExtractor={(item) => item.id}
        ListEmptyComponent={
          <EmptyState
            actionLabel="필터 초기화"
            compact
            description="검색어나 필터를 조금만 조정하면 원하는 링크를 더 빨리 찾을 수 있어요."
            icon="search-outline"
            onAction={clearFilters}
            title="조건에 맞는 링크가 없어요"
          />
        }
        ListHeaderComponent={
          <View style={{ gap: 12, paddingBottom: 14 }}>
            <View style={{ alignItems: 'center', flexDirection: 'row', justifyContent: 'space-between' }}>
              <View style={{ flex: 1, gap: 2 }}>
                <Text style={{ ...textStyle('800'), color: colors.text, fontSize: 23 }}>보관함</Text>
                <Text style={{ ...textStyle('400'), color: colors.textMuted, fontSize: 13, lineHeight: 18 }}>
                  검색하고 필요한 링크만 빠르게 골라보세요.
                </Text>
              </View>

              <Pressable
                onPress={() => setSort(getNextSort(sort))}
                style={({ pressed }) => ({
                  alignItems: 'center',
                  backgroundColor: colors.surface,
                  borderColor: colors.border,
                  borderRadius: radius.pill,
                  borderWidth: 1,
                  flexDirection: 'row',
                  gap: 6,
                  opacity: pressed ? 0.86 : 1,
                  paddingHorizontal: 12,
                  paddingVertical: 8,
                })}
              >
                <Ionicons color={colors.textSoft} name="swap-vertical-outline" size={16} />
                <Text style={{ ...textStyle('700'), color: colors.text, fontSize: 12 }}>{currentSortLabel}</Text>
              </Pressable>
            </View>

            <SearchBar compact onChangeText={setSearch} value={search} />

            <View style={{ alignItems: 'center', flexDirection: 'row', justifyContent: 'space-between' }}>
              <Text style={{ ...textStyle('400'), color: colors.textMuted, fontSize: 12 }}>
                결과 {filteredItems.length}개{activeFilterCount ? ` · 필터 ${activeFilterCount}개 적용` : ''}
              </Text>

              <View style={{ alignItems: 'center', flexDirection: 'row', gap: 12 }}>
                {activeFilterCount ? (
                  <Pressable onPress={clearFilters}>
                    <Text style={{ ...textStyle('700'), color: colors.accent, fontSize: 12 }}>초기화</Text>
                  </Pressable>
                ) : null}

                <Pressable
                  onPress={() => setShowFilters((current) => !current)}
                  style={({ pressed }) => ({
                    alignItems: 'center',
                    flexDirection: 'row',
                    gap: 6,
                    opacity: pressed ? 0.75 : 1,
                  })}
                >
                  <Ionicons
                    color={colors.textSoft}
                    name={showFilters ? 'chevron-up-outline' : 'options-outline'}
                    size={16}
                  />
                  <Text style={{ ...textStyle('700'), color: colors.textSoft, fontSize: 12 }}>
                    {showFilters ? '필터 접기' : '필터 보기'}
                  </Text>
                </Pressable>
              </View>
            </View>

            {showFilters ? (
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
                  <Text style={{ ...textStyle('800'), color: colors.text, fontSize: 13 }}>보기 옵션</Text>
                  <FilterChips
                    activeValue={favoriteFilter}
                    compact
                    onChange={(value) => setFavoriteFilter(value as 'all' | 'favorites')}
                    options={favoriteOptions}
                  />
                </View>
              </View>
            ) : null}
          </View>
        }
        renderItem={({ item }) => <LinkCard href={getLinkDetailRoute(item.id)} item={item} />}
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
}
