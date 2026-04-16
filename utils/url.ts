import type { LinkCategory, LinkPlatform } from '@/constants/linkOptions';
import { PLATFORM_INITIALS } from '@/constants/linkOptions';
import type { DerivedLinkPreview, LinkMetadata } from '@/features/links/types';

const PLATFORM_HOSTS: Record<LinkPlatform, string[]> = {
  YouTube: ['youtube.com', 'youtu.be'],
  Instagram: ['instagram.com'],
  X: ['x.com', 'twitter.com'],
  TikTok: ['tiktok.com'],
  Blog: ['blog.', 'tistory.com', 'medium.com', 'substack.com', 'velog.io', 'brunch.co.kr'],
  News: [
    'news.',
    'bbc.com',
    'cnn.com',
    'nytimes.com',
    'reuters.com',
    'yna.co.kr',
    'hani.co.kr',
    'joongang.co.kr',
    'chosun.com',
  ],
  Shopping: [
    'amazon.',
    'coupang.com',
    '11st.co.kr',
    'gmarket.co.kr',
    'musinsa.com',
    'shopping.naver.com',
  ],
  Other: [],
};

const FRIENDLY_HOST_LABELS: Record<string, string> = {
  'youtube.com': 'YouTube',
  'youtu.be': 'YouTube',
  'instagram.com': 'Instagram',
  'x.com': 'X',
  'twitter.com': 'X',
  'tiktok.com': 'TikTok',
  'velog.io': 'Velog',
  'medium.com': 'Medium',
  'substack.com': 'Substack',
  'tistory.com': 'Tistory',
  'brunch.co.kr': 'Brunch',
  'bbc.com': 'BBC',
  'cnn.com': 'CNN',
  'nytimes.com': 'New York Times',
  'reuters.com': 'Reuters',
  'coupang.com': 'Coupang',
  'musinsa.com': 'Musinsa',
};

const PATH_STOP_WORDS = new Set([
  'watch',
  'p',
  'reel',
  'video',
  'status',
  'articles',
  'article',
  'post',
  'posts',
  'product',
  'products',
  'vp',
  'news',
]);

const DEFAULT_SUMMARY_BY_PLATFORM: Record<LinkPlatform, string> = {
  YouTube: '저장한 영상 링크입니다. 나중에 다시 보기 좋게 보관했어요.',
  Instagram: '저장한 소셜 콘텐츠 링크입니다.',
  X: '저장한 소셜 콘텐츠 링크입니다.',
  TikTok: '저장한 소셜 콘텐츠 링크입니다.',
  Blog: '저장한 블로그 링크입니다. 읽고 난 뒤 핵심 포인트를 메모로 남겨보세요.',
  News: '저장한 기사 링크입니다. 핵심 내용을 메모로 정리해보세요.',
  Shopping: '저장한 상품 링크입니다. 가격/비교 포인트를 메모로 남겨보세요.',
  Other: '저장한 링크입니다.',
};

export function normalizeUrl(input: string) {
  const trimmed = input.trim();

  if (!trimmed) {
    return '';
  }

  if (/^[a-z][a-z0-9+.-]*:\/\//i.test(trimmed)) {
    return trimmed;
  }

  return `https://${trimmed}`;
}

export function safeParseUrl(input: string) {
  try {
    const normalized = normalizeUrl(input);
    return normalized ? new URL(normalized) : null;
  } catch {
    return null;
  }
}

export function detectPlatform(input: string): LinkPlatform {
  const parsed = safeParseUrl(input);
  const hostname = parsed?.hostname.toLowerCase().replace(/^www\./, '') ?? '';

  if (!hostname) {
    return 'Other';
  }

  for (const [platform, patterns] of Object.entries(PLATFORM_HOSTS) as [LinkPlatform, string[]][]) {
    if (patterns.some((pattern) => hostname.includes(pattern))) {
      return platform;
    }
  }

  return 'Other';
}

export function getSuggestedCategory(platform: LinkPlatform): LinkCategory {
  switch (platform) {
    case 'Shopping':
      return '쇼핑';
    case 'Blog':
    case 'News':
      return '공부';
    case 'YouTube':
    case 'Instagram':
    case 'X':
    case 'TikTok':
      return '나중에보기';
    default:
      return '기타';
  }
}

export function getHostnameLabel(input: string) {
  const parsed = safeParseUrl(input);

  if (!parsed) {
    return '링크';
  }

  const hostname = parsed.hostname.replace(/^www\./, '');

  return FRIENDLY_HOST_LABELS[hostname] ?? hostname;
}

function cleanPathSegment(segment: string) {
  return decodeURIComponent(segment)
    .replace(/[@?].*$/g, '')
    .replace(/\.[a-z0-9]+$/i, '')
    .replace(/[-_]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function titleCaseLatin(text: string) {
  return text.replace(/\b([a-z])/g, (value) => value.toUpperCase());
}

function isOpaqueSegment(segment: string) {
  return /^[a-z0-9]{6,}$/i.test(segment) && !/[aeiou]/i.test(segment);
}

function isYouTubeVideoId(segment: string) {
  return /^[A-Za-z0-9_-]{11}$/.test(segment);
}

function normalizeInstagramKind(kind: string) {
  if (kind === 'reels') {
    return 'reel';
  }

  return kind;
}

export function extractInstagramContentInfo(input: string) {
  const parsed = safeParseUrl(input);

  if (!parsed) {
    return null;
  }

  const hostname = parsed.hostname.replace(/^www\./, '');

  if (!hostname.includes('instagram.com')) {
    return null;
  }

  const [rawKind = '', rawShortcode = ''] = parsed.pathname.split('/').filter(Boolean);
  const kind = normalizeInstagramKind(rawKind);
  const shortcode = rawShortcode.trim();

  if (!kind || !shortcode) {
    return null;
  }

  return {
    kind,
    shortcode,
  };
}

function pickMeaningfulSegment(parsed: URL) {
  const rawSegments = parsed.pathname.split('/').filter(Boolean);

  for (let index = rawSegments.length - 1; index >= 0; index -= 1) {
    const rawSegment = rawSegments[index];
    const cleanedSegment = cleanPathSegment(rawSegment);

    if (!cleanedSegment) {
      continue;
    }

    if (PATH_STOP_WORDS.has(cleanedSegment.toLowerCase())) {
      continue;
    }

    if (cleanedSegment.length < 3) {
      continue;
    }

    if (isYouTubeVideoId(rawSegment)) {
      continue;
    }

    if (isOpaqueSegment(rawSegment) || /^\d+$/.test(cleanedSegment)) {
      continue;
    }

    return cleanedSegment;
  }

  return '';
}

export function createFallbackTitle(input: string, platform?: LinkPlatform) {
  const parsed = safeParseUrl(input);

  if (!parsed) {
    return '새 링크';
  }

  const candidate = pickMeaningfulSegment(parsed);
  const hostname = getHostnameLabel(input);

  if (platform === 'YouTube' && extractYoutubeVideoId(input)) {
    return 'YouTube 영상';
  }

  if (platform === 'Instagram') {
    const contentInfo = extractInstagramContentInfo(input);

    if (contentInfo?.kind === 'reel') {
      return 'Instagram 릴스';
    }

    if (contentInfo?.kind) {
      return 'Instagram 게시물';
    }
  }

  if (candidate) {
    return `${titleCaseLatin(candidate)} | ${hostname}`;
  }

  if (platform && platform !== 'Other') {
    return `${platform} 링크`;
  }

  return `${hostname} 링크`;
}

export function extractYoutubeVideoId(input: string) {
  const parsed = safeParseUrl(input);

  if (!parsed) {
    return '';
  }

  const hostname = parsed.hostname.replace(/^www\./, '');

  if (hostname === 'youtu.be') {
    return parsed.pathname.replace('/', '');
  }

  if (hostname.includes('youtube.com')) {
    return parsed.searchParams.get('v') ?? '';
  }

  return '';
}

export function getEmbeddedPlayableUrl(input: string, platform?: LinkPlatform) {
  const resolvedPlatform = platform ?? detectPlatform(input);

  if (resolvedPlatform === 'YouTube') {
    const videoId = extractYoutubeVideoId(input);

    if (videoId) {
      return `https://www.youtube.com/embed/${videoId}`;
    }
  }

  if (resolvedPlatform === 'Instagram') {
    const contentInfo = extractInstagramContentInfo(input);

    if (contentInfo && ['p', 'reel', 'tv'].includes(contentInfo.kind)) {
      return `https://www.instagram.com/${contentInfo.kind}/${contentInfo.shortcode}/embed/`;
    }
  }

  return '';
}

export function buildThumbnailUrl(input: string, platform: LinkPlatform) {
  if (platform === 'YouTube') {
    const videoId = extractYoutubeVideoId(input);

    if (videoId) {
      return `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
    }
  }

  return '';
}

export function getPlatformInitials(platform: LinkPlatform) {
  return PLATFORM_INITIALS[platform];
}

export function getAutoSummaryTemplate(platform: LinkPlatform) {
  return DEFAULT_SUMMARY_BY_PLATFORM[platform];
}

export function isLikelyAutoTitle(title: string, input: string, platform: LinkPlatform) {
  const trimmedTitle = title.trim();

  if (!trimmedTitle) {
    return true;
  }

  if (trimmedTitle === createFallbackTitle(input, platform)) {
    return true;
  }

  if (platform === 'YouTube') {
    const videoId = extractYoutubeVideoId(input);

    if (videoId && trimmedTitle === videoId) {
      return true;
    }
  }

  return false;
}

export async function fetchLinkMetadata(input: string, signal?: AbortSignal): Promise<LinkMetadata | null> {
  const normalizedUrl = normalizeUrl(input);

  if (!normalizedUrl) {
    return null;
  }

  const platform = detectPlatform(normalizedUrl);

  if (platform !== 'YouTube' || !extractYoutubeVideoId(normalizedUrl)) {
    return null;
  }

  try {
    const response = await fetch(
      `https://www.youtube.com/oembed?url=${encodeURIComponent(normalizedUrl)}&format=json`,
      { signal },
    );

    if (!response.ok) {
      return null;
    }

    const data = (await response.json()) as {
      title?: string;
      thumbnail_url?: string;
    };

    return {
      embedUrl: getEmbeddedPlayableUrl(normalizedUrl, platform),
      thumbnailUrl: data.thumbnail_url?.trim() || buildThumbnailUrl(normalizedUrl, platform),
      title: data.title?.trim(),
    };
  } catch {
    return null;
  }
}

export function deriveLinkPreview(input: string): DerivedLinkPreview {
  const normalizedUrl = normalizeUrl(input);

  if (!normalizedUrl) {
    return {
      normalizedUrl: '',
      detectedPlatform: 'Other',
      title: '',
      thumbnailUrl: '',
      embedUrl: '',
      suggestedCategory: '기타',
      hostnameLabel: 'URL을 입력해 주세요',
      summaryTemplate: '',
    };
  }

  const detectedPlatform = detectPlatform(normalizedUrl);
  const title = createFallbackTitle(normalizedUrl, detectedPlatform);
  const thumbnailUrl = buildThumbnailUrl(normalizedUrl, detectedPlatform);
  const embedUrl = getEmbeddedPlayableUrl(normalizedUrl, detectedPlatform);
  const suggestedCategory = getSuggestedCategory(detectedPlatform);
  const hostnameLabel = getHostnameLabel(normalizedUrl);
  const summaryTemplate = getAutoSummaryTemplate(detectedPlatform);

  return {
    normalizedUrl,
    detectedPlatform,
    embedUrl,
    title,
    thumbnailUrl,
    suggestedCategory,
    hostnameLabel,
    summaryTemplate,
  };
}

export function isValidLinkUrl(input: string) {
  const parsed = safeParseUrl(input);

  return Boolean(parsed && ['http:', 'https:'].includes(parsed.protocol));
}
