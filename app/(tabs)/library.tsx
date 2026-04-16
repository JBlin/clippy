import { useLocalSearchParams } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import { FlatList, Pressable, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { EmptyState } from '@/components/EmptyState';
import { FilterChips, type FilterChipOption } from '@/components/FilterChips';
import { LinkCard } from '@/components/LinkCard';
import { SearchBar } from '@/components/SearchBar';
import {
  LINK_CATEGORIES,
  LINK_PLATFORMS,
  SORT_OPTIONS,
  type LinkCategory,
  type LinkPlatform,
  type LinkSort,
} from '@/constants/linkOptions';
import { colors, spacing, textStyle } from '@/constants/theme';
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
const categoryOptions: FilterChipOption<LinkCategory | 'all'>[] = [
  { label: '전체', value: 'all' },
  ...LINK_CATEGORIES.map((category) => ({
    label: category,
    value: category,
  })),
];

export default function LibraryScreen() {
  const params = useLocalSearchParams<{ category?: string; platform?: string }>();
  const items = useLinkStore((state) => state.items);
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState<LinkSort>('latest');
  const [platform, setPlatform] = useState<LinkPlatform | 'all'>('all');
  const [category, setCategory] = useState<LinkCategory | 'all'>('all');

  function clearFilters() {
    setSearch('');
    setSort('latest');
    setPlatform('all');
    setCategory('all');
  }

  useEffect(() => {
    const nextCategory = getSingleParam(params.category);
    const nextPlatform = getSingleParam(params.platform);

    if (nextCategory && LINK_CATEGORIES.includes(nextCategory as LinkCategory)) {
      setCategory(nextCategory as LinkCategory);
    }

    if (nextPlatform && LINK_PLATFORMS.includes(nextPlatform as LinkPlatform)) {
      setPlatform(nextPlatform as LinkPlatform);
    }
  }, [params.category, params.platform]);

  const filteredItems = useMemo(
    () =>
      applyLinkQuery(items, {
        category,
        platform,
        search,
        sort,
      }),
    [category, items, platform, search, sort],
  );
  const activeFilterCount = countActiveQueryFilters({ category, platform, search, sort });

  return (
    <SafeAreaView edges={['top']} style={{ backgroundColor: colors.background, flex: 1 }}>
      <FlatList
        contentContainerStyle={{
          gap: spacing.lg,
          padding: spacing.lg,
          paddingBottom: spacing.xxl,
        }}
        data={filteredItems}
        keyExtractor={(item) => item.id}
        ListEmptyComponent={
          <EmptyState
            actionLabel="필터 초기화"
            description="검색어와 필터를 조정하면 원하는 링크를 더 빨리 찾을 수 있어요."
            icon="search-outline"
            onAction={clearFilters}
            title="조건에 맞는 링크가 없어요"
          />
        }
        ListHeaderComponent={
          <View style={{ gap: spacing.lg }}>
            <View style={{ gap: 8 }}>
              <Text style={{ ...textStyle('800'), color: colors.text, fontSize: 28 }}>보관함</Text>
              <Text style={{ ...textStyle('400'), color: colors.textMuted, fontSize: 15, lineHeight: 22 }}>
                전체 링크를 검색하고, 플랫폼과 카테고리별로 깔끔하게 정리해 보세요.
              </Text>
            </View>

            <SearchBar value={search} onChangeText={setSearch} />

            <View
              style={{
                alignItems: 'center',
                backgroundColor: colors.surface,
                borderRadius: 16,
                flexDirection: 'row',
                justifyContent: 'space-between',
                paddingHorizontal: 16,
                paddingVertical: 14,
              }}
            >
              <View style={{ gap: 4 }}>
                <Text style={{ ...textStyle('800'), color: colors.text, fontSize: 16 }}>
                  결과 {filteredItems.length}개
                </Text>
                <Text style={{ ...textStyle('400'), color: colors.textMuted, fontSize: 13 }}>
                  {activeFilterCount
                    ? `현재 ${activeFilterCount}개의 필터가 적용되어 있어요.`
                    : '전체 링크를 보고 있어요.'}
                </Text>
              </View>
              {activeFilterCount ? (
                <Pressable onPress={clearFilters}>
                  <Text style={{ ...textStyle('700'), color: colors.accent, fontSize: 13 }}>필터 지우기</Text>
                </Pressable>
              ) : null}
            </View>

            <View style={{ gap: 10 }}>
              <Text style={{ ...textStyle('800'), color: colors.text, fontSize: 15 }}>정렬</Text>
              <FilterChips
                activeValue={sort}
                onChange={(value) => setSort(value as LinkSort)}
                options={SORT_OPTIONS.map((option) => ({ label: option.label, value: option.value }))}
              />
            </View>

            <View style={{ gap: 10 }}>
              <Text style={{ ...textStyle('800'), color: colors.text, fontSize: 15 }}>플랫폼</Text>
              <FilterChips
                activeValue={platform}
                onChange={(value) => setPlatform(value as LinkPlatform | 'all')}
                options={platformOptions}
              />
            </View>

            <View style={{ gap: 10 }}>
              <Text style={{ ...textStyle('800'), color: colors.text, fontSize: 15 }}>카테고리</Text>
              <FilterChips
                activeValue={category}
                onChange={(value) => setCategory(value as LinkCategory | 'all')}
                options={categoryOptions}
              />
            </View>
          </View>
        }
        renderItem={({ item }) => <LinkCard href={getLinkDetailRoute(item.id)} item={item} />}
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
}
