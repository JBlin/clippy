export const LINK_PLATFORMS = [
  'YouTube',
  'Instagram',
  'X',
  'TikTok',
  'Blog',
  'News',
  'Shopping',
  'Other',
] as const;

export type LinkPlatform = (typeof LINK_PLATFORMS)[number];

export const LINK_CATEGORIES = ['업무', '아이디어', '공부', '쇼핑', '나중에보기', '기타'] as const;

export type LinkCategory = (typeof LINK_CATEGORIES)[number];

export const SORT_OPTIONS = [
  { label: '최신순', value: 'latest' },
  { label: '오래된순', value: 'oldest' },
  { label: '즐겨찾기순', value: 'favorites' },
  { label: '플랫폼순', value: 'platform' },
  { label: '카테고리순', value: 'category' },
] as const;

export type LinkSort = (typeof SORT_OPTIONS)[number]['value'];

export const PLATFORM_LABELS: Record<LinkPlatform, string> = {
  YouTube: 'YouTube',
  Instagram: 'Instagram',
  X: 'X',
  TikTok: 'TikTok',
  Blog: 'Blog',
  News: 'News',
  Shopping: 'Shopping',
  Other: 'Other',
};

export const PLATFORM_INITIALS: Record<LinkPlatform, string> = {
  YouTube: 'YT',
  Instagram: 'IG',
  X: 'X',
  TikTok: 'TT',
  Blog: 'BL',
  News: 'NW',
  Shopping: 'SP',
  Other: 'OT',
};
