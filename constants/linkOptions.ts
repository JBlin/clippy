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

export const DEFAULT_LINK_CATEGORIES = ['영상', '쇼핑', 'SNS', '읽을거리', '참고자료'] as const;

export const LINK_CATEGORIES = DEFAULT_LINK_CATEGORIES;

export type LinkCategory = string;

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
  Blog: '블로그',
  News: '뉴스',
  Shopping: '쇼핑',
  Other: '기타',
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
