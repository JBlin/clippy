import type { LinkItem, LinkQueryOptions } from '@/features/links/types';

function normalizeSearch(input: string) {
  return input.trim().toLocaleLowerCase('ko-KR');
}

function buildSearchTokens(search: string) {
  return normalizeSearch(search)
    .split(/\s+/)
    .map((token) => token.trim())
    .filter(Boolean);
}

function matchesSearch(item: LinkItem, search: string) {
  const tokens = buildSearchTokens(search);

  if (!tokens.length) {
    return true;
  }

  const haystack = [
    item.title,
    item.memo,
    item.summary,
    item.tags.join(' '),
    item.originalUrl,
    item.category,
    item.detectedPlatform,
  ]
    .join(' ')
    .toLocaleLowerCase('ko-KR');

  return tokens.every((token) => haystack.includes(token));
}

function compareByLatest(a: LinkItem, b: LinkItem) {
  return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
}

function sortLinks(items: LinkItem[], sort: LinkQueryOptions['sort']) {
  const next = [...items];

  switch (sort) {
    case 'oldest':
      return next.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
    case 'favorites':
      return next.sort((a, b) => {
        if (a.isFavorite === b.isFavorite) {
          return compareByLatest(a, b);
        }

        return Number(b.isFavorite) - Number(a.isFavorite);
      });
    case 'platform':
      return next.sort((a, b) => {
        const platformCompare = a.detectedPlatform.localeCompare(b.detectedPlatform, 'ko-KR');
        return platformCompare || compareByLatest(a, b);
      });
    case 'category':
      return next.sort((a, b) => {
        const categoryCompare = a.category.localeCompare(b.category, 'ko-KR');
        return categoryCompare || compareByLatest(a, b);
      });
    case 'latest':
    default:
      return next.sort(compareByLatest);
  }
}

export function applyLinkQuery(items: LinkItem[], options: LinkQueryOptions) {
  const search = normalizeSearch(options.search ?? '');

  const filtered = items.filter((item) => {
    const platformMatched =
      !options.platform || options.platform === 'all' || item.detectedPlatform === options.platform;
    const categoryMatched =
      !options.category || options.category === 'all' || item.category === options.category;
    const favoriteMatched = !options.favoritesOnly || item.isFavorite;

    return platformMatched && categoryMatched && favoriteMatched && matchesSearch(item, search);
  });

  return sortLinks(filtered, options.sort ?? 'latest');
}
