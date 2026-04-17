import type { LinkCategory, LinkPlatform } from '@/constants/linkOptions';
import { PLATFORM_INITIALS } from '@/constants/linkOptions';
import type { DerivedLinkPreview, LinkMetadata } from '@/features/links/types';
import { buildAutoTags, inferAutoCategory } from '@/utils/linkAutomation';

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
    'smartstore.naver.com',
    'brand.naver.com',
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
  'blog.naver.com': 'Naver Blog',
  'shopping.naver.com': 'Naver Shopping',
  'smartstore.naver.com': 'Naver Smart Store',
  'brand.naver.com': 'Naver Brand Store',
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
  'item',
  'shorts',
  'embed',
  'live',
]);

const DEFAULT_SUMMARY_BY_PLATFORM: Record<LinkPlatform, string> = {
  YouTube: '저장한 영상 링크입니다. 나중에 다시 보기 좋게 보관했어요.',
  Instagram: '저장한 소셜 콘텐츠 링크입니다.',
  X: '저장한 소셜 콘텐츠 링크입니다.',
  TikTok: '저장한 소셜 콘텐츠 링크입니다.',
  Blog: '저장한 블로그 링크입니다. 읽고 싶은 포인트를 메모로 남겨보세요.',
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

export function getSuggestedCategory(input: string, platform: LinkPlatform): LinkCategory {
  return inferAutoCategory(normalizeUrl(input), platform);
}

export function getHostnameLabel(input: string) {
  const parsed = safeParseUrl(input);

  if (!parsed) {
    return '링크';
  }

  const hostname = parsed.hostname.replace(/^www\./, '');
  const friendlyLabel = Object.entries(FRIENDLY_HOST_LABELS).find(
    ([pattern]) => hostname === pattern || hostname.endsWith(`.${pattern}`),
  )?.[1];

  return friendlyLabel ?? hostname;
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

function isValidYoutubeVideoId(segment: string) {
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

  return { kind, shortcode };
}

function normalizeSocialHandle(value: string) {
  const cleanedValue = value.trim().replace(/^@+/, '');
  return cleanedValue ? `@${cleanedValue}` : '';
}

export function extractXStatusInfo(input: string) {
  const parsed = safeParseUrl(input);

  if (!parsed) {
    return null;
  }

  const hostname = parsed.hostname.replace(/^www\./, '').toLowerCase();

  if (!hostname.includes('x.com') && !hostname.includes('twitter.com')) {
    return null;
  }

  const [rawUsername = '', rawKind = '', rawStatusId = ''] = parsed.pathname.split('/').filter(Boolean);
  const username = normalizeSocialHandle(rawUsername);
  const kind = rawKind.toLowerCase();
  const statusId = rawStatusId.trim();

  if (!username || kind !== 'status' || !statusId) {
    return null;
  }

  return { statusId, username };
}

export function extractTikTokVideoInfo(input: string) {
  const parsed = safeParseUrl(input);

  if (!parsed) {
    return null;
  }

  const hostname = parsed.hostname.replace(/^www\./, '').toLowerCase();

  if (!hostname.includes('tiktok.com')) {
    return null;
  }

  const [rawUsername = '', rawKind = '', rawVideoId = ''] = parsed.pathname.split('/').filter(Boolean);
  const username = normalizeSocialHandle(rawUsername);
  const kind = rawKind.toLowerCase();
  const videoId = rawVideoId.trim();

  if (!username || kind !== 'video' || !videoId) {
    return null;
  }

  return { username, videoId };
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

    if (isValidYoutubeVideoId(rawSegment)) {
      continue;
    }

    if (isOpaqueSegment(rawSegment) || /^\d+$/.test(cleanedSegment)) {
      continue;
    }

    return cleanedSegment;
  }

  return '';
}

export function extractYoutubeVideoId(input: string) {
  const parsed = safeParseUrl(input);

  if (!parsed) {
    return '';
  }

  const hostname = parsed.hostname.replace(/^www\./, '').toLowerCase();

  if (hostname === 'youtu.be') {
    const candidate = parsed.pathname.split('/').filter(Boolean)[0] ?? '';
    return isValidYoutubeVideoId(candidate) ? candidate : '';
  }

  if (!hostname.includes('youtube.com')) {
    return '';
  }

  const paramVideoId = parsed.searchParams.get('v') ?? '';

  if (isValidYoutubeVideoId(paramVideoId)) {
    return paramVideoId;
  }

  const segments = parsed.pathname.split('/').filter(Boolean);
  const knownContainerIndex = segments.findIndex((segment) => ['shorts', 'embed', 'live', 'v'].includes(segment));

  if (knownContainerIndex >= 0) {
    const candidate = segments[knownContainerIndex + 1] ?? '';
    return isValidYoutubeVideoId(candidate) ? candidate : '';
  }

  return '';
}

export function createFallbackTitle(input: string, platform?: LinkPlatform) {
  const parsed = safeParseUrl(input);

  if (!parsed) {
    return '저장한 링크';
  }

  const candidate = pickMeaningfulSegment(parsed);
  const hostname = getHostnameLabel(input);

  if (platform === 'YouTube') {
    if (candidate) {
      return `${titleCaseLatin(candidate)} | YouTube`;
    }

    if (extractYoutubeVideoId(input)) {
      return 'YouTube 영상 다시 보기';
    }
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

  if (platform === 'X') {
    const statusInfo = extractXStatusInfo(input);

    if (statusInfo?.username) {
      return `${statusInfo.username}님의 X 게시물`;
    }

    return 'X 게시물';
  }

  if (platform === 'TikTok') {
    const videoInfo = extractTikTokVideoInfo(input);

    if (videoInfo?.username) {
      return `${videoInfo.username}님의 TikTok 영상`;
    }

    return 'TikTok 영상';
  }

  if (platform === 'Shopping') {
    if (candidate) {
      return `${titleCaseLatin(candidate)} | ${hostname}`;
    }

    return `${hostname} 상품`;
  }

  if (platform === 'News') {
    if (candidate) {
      return `${titleCaseLatin(candidate)} | ${hostname}`;
    }

    return `${hostname} 기사`;
  }

  if (platform === 'Blog') {
    if (candidate) {
      return `${titleCaseLatin(candidate)} | ${hostname}`;
    }

    return `${hostname} 글`;
  }

  if (candidate) {
    return `${titleCaseLatin(candidate)} | ${hostname}`;
  }

  if (platform && platform !== 'Other') {
    return `${hostname} 링크`;
  }

  return `${hostname} 링크`;
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

  if (!safeParseUrl(input)) {
    return '';
  }

  return getSiteIconUrl(input, 256);
}

export function getPlatformInitials(platform: LinkPlatform) {
  return PLATFORM_INITIALS[platform];
}

export function getAutoSummaryTemplate(platform: LinkPlatform) {
  return DEFAULT_SUMMARY_BY_PLATFORM[platform];
}

export function isLikelyAutoSummary(summary: string, platform: LinkPlatform) {
  const trimmedSummary = summary.trim();

  if (!trimmedSummary) {
    return true;
  }

  return trimmedSummary === getAutoSummaryTemplate(platform);
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

    if (trimmedTitle === 'YouTube 영상' || trimmedTitle === 'YouTube 영상 다시 보기') {
      return true;
    }
  }

  return false;
}

function normalizeWhitespace(text: string) {
  return text.replace(/\s+/g, ' ').trim();
}

function decodeHtmlEntities(text: string) {
  return text.replace(/&(#x?[0-9a-f]+|amp|quot|apos|#39|lt|gt|nbsp);/gi, (match, entity) => {
    const normalizedEntity = entity.toLowerCase();

    switch (normalizedEntity) {
      case 'amp':
        return '&';
      case 'quot':
        return '"';
      case 'apos':
      case '#39':
        return "'";
      case 'lt':
        return '<';
      case 'gt':
        return '>';
      case 'nbsp':
        return ' ';
      default: {
        if (normalizedEntity.startsWith('#x')) {
          return String.fromCodePoint(Number.parseInt(normalizedEntity.slice(2), 16));
        }

        if (normalizedEntity.startsWith('#')) {
          return String.fromCodePoint(Number.parseInt(normalizedEntity.slice(1), 10));
        }

        return match;
      }
    }
  });
}

function extractHtmlTitle(html: string) {
  const match = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
  return match ? normalizeWhitespace(decodeHtmlEntities(match[1])) : '';
}

function extractFirstHeadingText(html: string) {
  const match = html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i);
  const headingText = match?.[1]
    ?.replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  return headingText ? decodeHtmlEntities(headingText) : '';
}

function extractJsonLdTitle(html: string) {
  const scriptMatches = html.matchAll(
    /<script[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi,
  );

  function findTitleCandidate(value: unknown): string {
    if (!value || typeof value !== 'object') {
      return '';
    }

    if (Array.isArray(value)) {
      for (const entry of value) {
        const match = findTitleCandidate(entry);

        if (match) {
          return match;
        }
      }

      return '';
    }

    const record = value as Record<string, unknown>;
    const directCandidate =
      (typeof record.headline === 'string' && record.headline) ||
      (typeof record.name === 'string' && record.name) ||
      (typeof record.alternativeHeadline === 'string' && record.alternativeHeadline) ||
      '';

    if (directCandidate) {
      return normalizeWhitespace(directCandidate);
    }

    for (const nestedValue of Object.values(record)) {
      const nestedCandidate = findTitleCandidate(nestedValue);

      if (nestedCandidate) {
        return nestedCandidate;
      }
    }

    return '';
  }

  for (const scriptMatch of scriptMatches) {
    const rawJson = scriptMatch[1]?.trim();

    if (!rawJson) {
      continue;
    }

    try {
      const parsedJson = JSON.parse(rawJson) as unknown;
      const titleCandidate = findTitleCandidate(parsedJson);

      if (titleCandidate) {
        return decodeHtmlEntities(titleCandidate);
      }
    } catch {
      continue;
    }
  }

  return '';
}

function parseTagAttributes(tag: string) {
  const attributes: Record<string, string> = {};

  for (const match of tag.matchAll(/([a-zA-Z:-]+)\s*=\s*("([^"]*)"|'([^']*)'|([^\s"'=<>`]+))/g)) {
    const [, rawKey, , doubleQuoted, singleQuoted, bareValue] = match;
    attributes[rawKey.toLowerCase()] = decodeHtmlEntities(doubleQuoted ?? singleQuoted ?? bareValue ?? '');
  }

  return attributes;
}

function parseHtmlMetadata(html: string, normalizedUrl: string) {
  const metaEntries = new Map<string, string>();
  const linkEntries = new Map<string, string>();

  for (const tagMatch of html.matchAll(/<meta\b[^>]*>/gi)) {
    const attributes = parseTagAttributes(tagMatch[0]);
    const key = attributes.property ?? attributes.name ?? attributes.itemprop;
    const content = normalizeWhitespace(attributes.content ?? '');

    if (key && content && !metaEntries.has(key.toLowerCase())) {
      metaEntries.set(key.toLowerCase(), content);
    }
  }

  for (const tagMatch of html.matchAll(/<link\b[^>]*>/gi)) {
    const attributes = parseTagAttributes(tagMatch[0]);
    const relValue = normalizeWhitespace(attributes.rel ?? '').toLowerCase();
    const hrefValue = resolveUrl(normalizedUrl, attributes.href);

    if (!relValue || !hrefValue) {
      continue;
    }

    for (const relToken of relValue.split(/\s+/)) {
      if (relToken && !linkEntries.has(relToken)) {
        linkEntries.set(relToken, hrefValue);
      }
    }
  }

  const firstContentImageUrl = (() => {
    for (const imageMatch of html.matchAll(/<img\b[^>]*>/gi)) {
      const attributes = parseTagAttributes(imageMatch[0]);
      const source = resolveUrl(normalizedUrl, attributes.src ?? attributes['data-src'] ?? '');
      const loweredSource = source.toLowerCase();

      if (!source || loweredSource.startsWith('data:')) {
        continue;
      }

      if (
        ['sprite', 'logo', 'icon', 'avatar', 'profile', '.svg', '.ico'].some((token) =>
          loweredSource.includes(token),
        )
      ) {
        continue;
      }

      return source;
    }

    return '';
  })();

  const imageCandidate =
    metaEntries.get('og:image:secure_url') ||
    metaEntries.get('og:image:url') ||
    metaEntries.get('og:image') ||
    metaEntries.get('product:image') ||
    metaEntries.get('twitter:image') ||
    metaEntries.get('twitter:image:src') ||
    metaEntries.get('thumbnail') ||
    linkEntries.get('image_src') ||
    firstContentImageUrl ||
    linkEntries.get('apple-touch-icon') ||
    linkEntries.get('icon') ||
    linkEntries.get('shortcut');
  const imageUrl = resolveUrl(normalizedUrl, imageCandidate);

  return {
    description:
      metaEntries.get('og:description') ??
      metaEntries.get('description') ??
      metaEntries.get('twitter:description') ??
      '',
    siteName:
      metaEntries.get('og:site_name') ??
      metaEntries.get('application-name') ??
      metaEntries.get('twitter:site') ??
      '',
    thumbnailUrl: imageUrl,
    title:
      metaEntries.get('og:title') ||
      metaEntries.get('product:title') ||
      metaEntries.get('article:title') ||
      metaEntries.get('twitter:title') ||
      extractJsonLdTitle(html) ||
      metaEntries.get('title') ||
      extractHtmlTitle(html) ||
      extractFirstHeadingText(html),
  };
}

export function getSiteIconUrl(input: string, size = 256) {
  const normalizedUrl = normalizeUrl(input);
  const parsed = safeParseUrl(normalizedUrl);

  if (!parsed) {
    return '';
  }

  return `https://www.google.com/s2/favicons?sz=${size}&domain_url=${encodeURIComponent(parsed.origin)}`;
}

function resolveUrl(baseUrl: string, candidate?: string) {
  const trimmedCandidate = normalizeWhitespace(candidate ?? '');

  if (!trimmedCandidate) {
    return '';
  }

  try {
    return new URL(trimmedCandidate, baseUrl).toString();
  } catch {
    return '';
  }
}

function normalizeRemoteTitle(title: string, input: string, platform: LinkPlatform) {
  const cleanedTitle = normalizeWhitespace(title);

  if (!cleanedTitle) {
    return '';
  }

  const hostname = getHostnameLabel(input).toLocaleLowerCase('ko-KR');
  const normalizedTitle = cleanedTitle.toLocaleLowerCase('ko-KR');

  if (normalizedTitle === hostname) {
    return '';
  }

  if (platform === 'Instagram' && normalizedTitle === 'instagram') {
    return '';
  }

  return cleanedTitle;
}

function normalizeRemoteDescription(description: string, title?: string) {
  const cleanedDescription = normalizeWhitespace(description);

  if (!cleanedDescription) {
    return '';
  }

  if (title && normalizeForCompare(cleanedDescription) === normalizeForCompare(title)) {
    return '';
  }

  return cleanedDescription;
}

function normalizeForCompare(value: string) {
  return normalizeWhitespace(value).toLocaleLowerCase('ko-KR');
}

function createFallbackDescription(input: string, platform: LinkPlatform) {
  const sourceLabel = getHostnameLabel(input);

  switch (platform) {
    case 'YouTube':
      return `${sourceLabel} 영상 링크`;
    case 'Instagram':
    case 'X':
    case 'TikTok':
      return `${sourceLabel} 콘텐츠 링크`;
    case 'Shopping':
      return `${sourceLabel} 상품 링크`;
    case 'News':
    case 'Blog':
      return `${sourceLabel} 읽을거리`;
    default:
      return `${sourceLabel} 링크`;
  }
}

function extractXTitleFromHtml(html: string) {
  const tweetParagraphMatch = html.match(
    /<blockquote[^>]*class=["'][^"']*twitter-tweet[^"']*["'][^>]*>[\s\S]*?<p[^>]*>([\s\S]*?)<\/p>/i,
  );

  if (!tweetParagraphMatch?.[1]) {
    return '';
  }

  return normalizeWhitespace(
    decodeHtmlEntities(tweetParagraphMatch[1].replace(/<[^>]+>/g, ' '))
      .replace(/\s+(?:https?:\/\/)?t\.co\/\S+$/i, '')
      .replace(/\s+pic\.twitter\.com\/\S+$/i, ''),
  );
}

async function fetchYoutubeMetadata(normalizedUrl: string, signal?: AbortSignal): Promise<LinkMetadata | null> {
  const videoId = extractYoutubeVideoId(normalizedUrl);

  if (!videoId) {
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
      author_name?: string;
      provider_name?: string;
      title?: string;
      thumbnail_url?: string;
    };

    return {
      sourceLabel: data.author_name?.trim() || data.provider_name?.trim() || getHostnameLabel(normalizedUrl),
      thumbnailUrl: data.thumbnail_url?.trim() || buildThumbnailUrl(normalizedUrl, 'YouTube'),
      title: data.title?.trim() || '',
    };
  } catch {
    return null;
  }
}

async function fetchTikTokMetadata(normalizedUrl: string, signal?: AbortSignal): Promise<LinkMetadata | null> {
  try {
    const response = await fetch(`https://www.tiktok.com/oembed?url=${encodeURIComponent(normalizedUrl)}`, {
      headers: {
        Accept: 'application/json',
      },
      signal,
    });

    if (!response.ok) {
      return null;
    }

    const data = (await response.json()) as {
      author_name?: string;
      provider_name?: string;
      thumbnail_url?: string;
      title?: string;
    };

    return {
      sourceLabel: data.author_name?.trim() || data.provider_name?.trim() || getHostnameLabel(normalizedUrl),
      thumbnailUrl: data.thumbnail_url?.trim() || '',
      title: data.title?.trim() || '',
    };
  } catch {
    return null;
  }
}

async function fetchXMetadata(normalizedUrl: string, signal?: AbortSignal): Promise<LinkMetadata | null> {
  try {
    const response = await fetch(
      `https://publish.twitter.com/oembed?omit_script=1&lang=ko&url=${encodeURIComponent(normalizedUrl)}`,
      {
        headers: {
          Accept: 'application/json',
        },
        signal,
      },
    );

    if (!response.ok) {
      return null;
    }

    const data = (await response.json()) as {
      author_name?: string;
      html?: string;
      title?: string;
    };

    return {
      sourceLabel: data.author_name?.trim() || getHostnameLabel(normalizedUrl),
      title: data.title?.trim() || extractXTitleFromHtml(data.html ?? ''),
    };
  } catch {
    return null;
  }
}

async function fetchPlatformMetadata(
  platform: LinkPlatform,
  normalizedUrl: string,
  signal?: AbortSignal,
): Promise<LinkMetadata | null> {
  switch (platform) {
    case 'YouTube':
      return fetchYoutubeMetadata(normalizedUrl, signal);
    case 'TikTok':
      return fetchTikTokMetadata(normalizedUrl, signal);
    case 'X':
      return fetchXMetadata(normalizedUrl, signal);
    default:
      return null;
  }
}

interface FetchDirectLinkMetadataOptions {
  includeUserAgent?: boolean;
  signal?: AbortSignal;
}

function createHtmlMetadataRequestHeaders(includeUserAgent = false) {
  const headers: Record<string, string> = {
    Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
    'Accept-Language': 'ko-KR,ko;q=0.9,en-US;q=0.8,en;q=0.7',
    'Cache-Control': 'no-cache',
    Pragma: 'no-cache',
  };

  if (includeUserAgent) {
    headers['User-Agent'] =
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/135.0.0.0 Safari/537.36';
  }

  return headers;
}

function hasMetadataPayload(metadata: LinkMetadata | null | undefined) {
  return Boolean(
    metadata?.title ||
      metadata?.description ||
      metadata?.thumbnailUrl ||
      metadata?.sourceLabel ||
      metadata?.embedUrl,
  );
}

function isBrowserRuntime() {
  return typeof document !== 'undefined' && typeof window !== 'undefined';
}

async function fetchMetadataViaApiRoute(normalizedUrl: string, signal?: AbortSignal): Promise<LinkMetadata | null> {
  try {
    const response = await fetch(`/api/metadata?url=${encodeURIComponent(normalizedUrl)}`, {
      headers: {
        Accept: 'application/json',
      },
      signal,
    });

    if (!response.ok) {
      return null;
    }

    const payload = (await response.json()) as LinkMetadata | null;
    return hasMetadataPayload(payload) ? payload : null;
  } catch {
    return null;
  }
}

async function fetchHtmlMetadata(
  normalizedUrl: string,
  signal?: AbortSignal,
  includeUserAgent = false,
) {
  try {
    const response = await fetch(normalizedUrl, {
      headers: createHtmlMetadataRequestHeaders(includeUserAgent),
      redirect: 'follow',
      signal,
    });

    if (!response.ok) {
      return null;
    }

    const html = await response.text();

    if (!html.trim()) {
      return null;
    }

    return parseHtmlMetadata(html, normalizedUrl);
  } catch {
    return null;
  }
}

export async function fetchDirectLinkMetadata(
  input: string,
  options: FetchDirectLinkMetadataOptions = {},
): Promise<LinkMetadata | null> {
  const normalizedUrl = normalizeUrl(input);

  if (!normalizedUrl) {
    return null;
  }

  const { includeUserAgent = false, signal } = options;
  const platform = detectPlatform(normalizedUrl);
  const fallbackTitle = createFallbackTitle(normalizedUrl, platform);
  const fallbackDescription = createFallbackDescription(normalizedUrl, platform);
  const fallbackThumbnail = buildThumbnailUrl(normalizedUrl, platform);
  const embedUrl = getEmbeddedPlayableUrl(normalizedUrl, platform);
  const platformMetadata = await fetchPlatformMetadata(platform, normalizedUrl, signal);
  const htmlMetadata = await fetchHtmlMetadata(normalizedUrl, signal, includeUserAgent);
  const resolvedTitle = platformMetadata?.title ?? htmlMetadata?.title ?? '';
  const title = normalizeRemoteTitle(resolvedTitle, normalizedUrl, platform) || fallbackTitle;
  const description =
    normalizeRemoteDescription(platformMetadata?.description ?? htmlMetadata?.description ?? '', resolvedTitle || fallbackTitle) ||
    fallbackDescription;
  const thumbnailUrl = platformMetadata?.thumbnailUrl || htmlMetadata?.thumbnailUrl || fallbackThumbnail;
  const sourceLabel = platformMetadata?.sourceLabel || htmlMetadata?.siteName || getHostnameLabel(normalizedUrl);

  return {
    description,
    embedUrl,
    sourceLabel,
    thumbnailUrl,
    title,
  };
}

export async function fetchLinkMetadata(input: string, signal?: AbortSignal): Promise<LinkMetadata | null> {
  const normalizedUrl = normalizeUrl(input);

  if (!normalizedUrl) {
    return null;
  }

  if (isBrowserRuntime()) {
    const apiMetadata = await fetchMetadataViaApiRoute(normalizedUrl, signal);

    if (apiMetadata) {
      return apiMetadata;
    }
  }

  return fetchDirectLinkMetadata(normalizedUrl, { signal });
}

export function getReadableUrl(input: string, maxLength = 52) {
  const parsed = safeParseUrl(input);

  if (!parsed) {
    return input;
  }

  const hostname = parsed.hostname.replace(/^www\./, '');
  const pathname = parsed.pathname.replace(/\/$/, '');
  const videoId = extractYoutubeVideoId(input);
  const searchPart = videoId ? `?v=${videoId}` : '';
  const readable = `${hostname}${pathname}${searchPart}` || hostname;

  if (readable.length <= maxLength) {
    return readable;
  }

  return `${readable.slice(0, Math.max(0, maxLength - 1))}…`;
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
      suggestedCategory: '참고자료',
      suggestedTags: [],
      hostnameLabel: 'URL을 입력해 주세요',
      summaryTemplate: '',
    };
  }

  const detectedPlatform = detectPlatform(normalizedUrl);
  const title = createFallbackTitle(normalizedUrl, detectedPlatform);
  const thumbnailUrl = buildThumbnailUrl(normalizedUrl, detectedPlatform);
  const embedUrl = getEmbeddedPlayableUrl(normalizedUrl, detectedPlatform);
  const suggestedCategory = getSuggestedCategory(normalizedUrl, detectedPlatform);
  const suggestedTags = buildAutoTags(normalizedUrl, detectedPlatform, title);
  const hostnameLabel = getHostnameLabel(normalizedUrl);
  const summaryTemplate = getAutoSummaryTemplate(detectedPlatform);

  return {
    normalizedUrl,
    detectedPlatform,
    embedUrl,
    title,
    thumbnailUrl,
    suggestedCategory,
    suggestedTags,
    hostnameLabel,
    summaryTemplate,
  };
}

export function isValidLinkUrl(input: string) {
  const parsed = safeParseUrl(input);
  return Boolean(parsed && ['http:', 'https:'].includes(parsed.protocol));
}
