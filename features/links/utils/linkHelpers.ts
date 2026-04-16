import type { LinkFormValues, LinkItem, LinkQueryOptions } from '@/features/links/types';
import { isValidLinkUrl } from '@/utils/url';

export function validateLinkForm(values: LinkFormValues) {
  if (!values.originalUrl.trim()) {
    return '링크를 입력해 주세요.';
  }

  if (!isValidLinkUrl(values.originalUrl)) {
    return 'http 또는 https 형식의 URL을 입력해 주세요.';
  }

  if (!values.title.trim()) {
    return '제목을 입력해 주세요.';
  }

  return null;
}

export function getLinkCardSnippet(item: LinkItem) {
  const summary = item.summary.trim();
  const memo = item.memo.trim();

  if (summary && memo && summary !== memo) {
    return `${summary} · ${memo}`;
  }

  return summary || memo || '아직 요약이나 메모가 없는 링크예요.';
}

export function countActiveQueryFilters(options: LinkQueryOptions) {
  let count = 0;

  if (options.search?.trim()) {
    count += 1;
  }

  if (options.platform && options.platform !== 'all') {
    count += 1;
  }

  if (options.category && options.category !== 'all') {
    count += 1;
  }

  if (options.sort && options.sort !== 'latest') {
    count += 1;
  }

  return count;
}
