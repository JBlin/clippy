import type { LinkPlatform } from '@/constants/linkOptions';

function normalizeForMatch(value: string) {
  return value.trim().toLocaleLowerCase('ko-KR');
}

function safeParseHostname(input: string) {
  try {
    return new URL(input).hostname.replace(/^www\./, '').toLocaleLowerCase('ko-KR');
  } catch {
    return '';
  }
}

function dedupeStrings(values: string[]) {
  return Array.from(
    new Set(
      values
        .map((value) => value.trim())
        .filter(Boolean),
    ),
  );
}

function titleIncludes(title: string, keywords: string[]) {
  const normalizedTitle = normalizeForMatch(title);
  return keywords.some((keyword) => normalizedTitle.includes(normalizeForMatch(keyword)));
}

export function inferAutoCategory(input: string, platform: LinkPlatform, title = '') {
  const hostname = safeParseHostname(input);

  if (platform === 'YouTube') {
    return '영상';
  }

  if (
    platform === 'Shopping' ||
    ['shopping.naver.com', 'smartstore.naver.com', 'brand.naver.com', 'coupang.com'].some((domain) =>
      hostname.includes(domain),
    )
  ) {
    return '쇼핑';
  }

  if (platform === 'Instagram' || platform === 'X' || platform === 'TikTok') {
    return 'SNS';
  }

  if (
    platform === 'News' ||
    titleIncludes(title, ['뉴스', '아티클', '기사', '칼럼', '브리핑', '트렌드', '읽기'])
  ) {
    return '읽을거리';
  }

  if (
    platform === 'Blog' ||
    hostname.includes('github.com') ||
    hostname.includes('notion.so') ||
    hostname.includes('figma.com') ||
    titleIncludes(title, ['가이드', '문서', '레퍼런스', '참고', '설명서', '튜토리얼', 'docs'])
  ) {
    return '참고자료';
  }

  return '참고자료';
}

export function buildAutoTags(input: string, platform: LinkPlatform, title = '') {
  const hostname = safeParseHostname(input);
  const tags: string[] = [];

  switch (platform) {
    case 'YouTube':
      tags.push('유튜브', '영상');
      break;
    case 'Instagram':
      tags.push('인스타그램', 'SNS');
      break;
    case 'X':
      tags.push('X', 'SNS');
      break;
    case 'TikTok':
      tags.push('틱톡', 'SNS');
      break;
    case 'Shopping':
      tags.push('쇼핑');
      break;
    case 'News':
      tags.push('뉴스', '읽을거리');
      break;
    case 'Blog':
      tags.push('블로그', '읽을거리');
      break;
    default:
      break;
  }

  if (
    ['shopping.naver.com', 'smartstore.naver.com', 'brand.naver.com'].some((domain) => hostname.includes(domain))
  ) {
    tags.push('네이버쇼핑');
  }

  if (hostname.includes('blog.naver.com')) {
    tags.push('네이버블로그');
  }

  if (hostname.includes('github.com')) {
    tags.push('GitHub', '코드');
  }

  if (hostname.includes('notion.so')) {
    tags.push('문서');
  }

  if (hostname.includes('figma.com')) {
    tags.push('디자인');
  }

  if (titleIncludes(title, ['디자인', '레퍼런스', '브랜딩'])) {
    tags.push('디자인');
  }

  if (titleIncludes(title, ['개발', 'react', 'react native', 'expo', 'typescript', 'api'])) {
    tags.push('개발');
  }

  if (titleIncludes(title, ['가이드', '튜토리얼', '문서', '레퍼런스', '참고'])) {
    tags.push('참고');
  }

  return dedupeStrings(tags);
}
