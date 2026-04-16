import type { LinkItem, LinkQueryOptions } from '@/features/links/types';

function normalizeSearch(input: string) {
  return input.trim().toLocaleLowerCase('ko-KR');
}

function matchesSearch(item: LinkItem, search: string) {
  if (!search) {
    return true;
  }

  const haystack = [item.title, item.memo, item.summary, item.tags.join(' '), item.originalUrl]
    .join(' ')
    .toLocaleLowerCase('ko-KR');

  return haystack.includes(search);
}

function sortLinks(items: LinkItem[], sort: LinkQueryOptions['sort']) {
  const next = [...items];

  switch (sort) {
    case 'oldest':
      return next.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
    case 'favorites':
      return next.sort((a, b) => {
        if (a.isFavorite === b.isFavorite) {
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        }

        return Number(b.isFavorite) - Number(a.isFavorite);
      });
    case 'platform':
      return next.sort((a, b) => a.detectedPlatform.localeCompare(b.detectedPlatform, 'ko-KR'));
    case 'category':
      return next.sort((a, b) => a.category.localeCompare(b.category, 'ko-KR'));
    case 'latest':
    default:
      return next.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
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
