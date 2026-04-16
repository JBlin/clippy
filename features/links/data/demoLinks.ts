import type { LinkFormValues, LinkItem } from '@/features/links/types';
import { createLinkId } from '@/utils/id';
import { deriveLinkPreview, normalizeUrl } from '@/utils/url';

type DemoSeed = Omit<LinkFormValues, 'detectedPlatform' | 'thumbnailUrl' | 'title'> & {
  originalUrl: string;
  title?: string;
};

const DEMO_SEEDS: DemoSeed[] = [
  {
    originalUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    title: '제품 기획 회의 전에 볼 인사이트 영상',
    summary: '짧은 영상이지만 후킹 구조와 반복 소비 포인트를 참고하기 좋다.',
    category: '아이디어',
    tags: ['영상', '기획', '참고'],
    memo: '도입부 구성 참고',
    isFavorite: true,
  },
  {
    originalUrl: 'https://www.instagram.com/p/C9Clippy/',
    title: '인스타그램 레퍼런스 포스트',
    summary: '브랜딩 톤과 카드형 콘텐츠 구성이 깔끔한 사례다.',
    category: '아이디어',
    tags: ['브랜딩', '디자인'],
    memo: '썸네일 톤 참고',
    isFavorite: false,
  },
  {
    originalUrl: 'https://x.com/vercel/status/1888888888888888888',
    title: '배포 관련 업데이트 스레드',
    summary: '팀 공유용으로 저장해 둘 기술 업데이트 링크.',
    category: '업무',
    tags: ['배포', '업무', '업데이트'],
    memo: '다음 회의 안건',
    isFavorite: true,
  },
  {
    originalUrl: 'https://www.tiktok.com/@creator/video/7466666666666666666',
    title: '짧게 저장해 둔 트렌드 영상',
    summary: '짧은 포맷 실험 아이디어를 모아 보는 용도.',
    category: '나중에보기',
    tags: ['트렌드', '숏폼'],
    memo: '포맷 벤치마크',
    isFavorite: false,
  },
  {
    originalUrl: 'https://velog.io/@clippy/react-native-local-storage-mvp',
    title: '로컬 저장 구조 참고 글',
    summary: 'AsyncStorage 계층 분리 아이디어를 참고하기 좋은 글.',
    category: '공부',
    tags: ['React Native', 'AsyncStorage'],
    memo: '스토어 리팩터링 때 다시 보기',
    isFavorite: true,
  },
  {
    originalUrl: 'https://www.bbc.com/news/articles/c0example',
    title: '해외 뉴스 아티클',
    summary: '시장 트렌드 파악용으로 저장한 뉴스 링크.',
    category: '공부',
    tags: ['뉴스', '트렌드'],
    memo: '요약 문장 추후 AI 연동 예정',
    isFavorite: false,
  },
  {
    originalUrl: 'https://www.coupang.com/vp/products/1234567890',
    title: '나중에 비교할 구매 후보',
    summary: '가격과 후기 비교용으로 저장한 쇼핑 링크.',
    category: '쇼핑',
    tags: ['비교', '구매'],
    memo: '다음 달 예산 확인 후 구매',
    isFavorite: false,
  },
  {
    originalUrl: 'https://www.notion.so/clippy/product-roadmap-links',
    title: '프로덕트 로드맵 문서',
    summary: '링크를 다시 정리해서 팀 공유할 때 참고할 문서.',
    category: '업무',
    tags: ['문서', '로드맵'],
    memo: '업무 링크 정리 기준으로 활용',
    isFavorite: true,
  },
];

export function createDemoLinks(): LinkItem[] {
  const now = Date.now();

  return DEMO_SEEDS.map((seed, index) => {
    const preview = deriveLinkPreview(seed.originalUrl);
    const timestamp = new Date(now - index * 1000 * 60 * 60 * 9).toISOString();

    return {
      id: createLinkId(),
      originalUrl: normalizeUrl(seed.originalUrl),
      detectedPlatform: preview.detectedPlatform,
      title: seed.title ?? preview.title,
      thumbnailUrl: preview.thumbnailUrl,
      summary: seed.summary,
      category: seed.category,
      tags: seed.tags,
      memo: seed.memo,
      isFavorite: seed.isFavorite,
      createdAt: timestamp,
      updatedAt: timestamp,
    };
  });
}
