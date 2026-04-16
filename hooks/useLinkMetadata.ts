import { useEffect, useMemo, useState } from 'react';

import type { LinkMetadata } from '@/features/links/types';
import { detectPlatform, extractYoutubeVideoId, fetchLinkMetadata, normalizeUrl } from '@/utils/url';

export function useLinkMetadata(input: string) {
  const normalizedUrl = useMemo(() => normalizeUrl(input), [input]);
  const platform = useMemo(() => detectPlatform(normalizedUrl), [normalizedUrl]);
  const [metadata, setMetadata] = useState<LinkMetadata | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    setMetadata(null);

    if (!normalizedUrl || platform !== 'YouTube' || !extractYoutubeVideoId(normalizedUrl)) {
      setIsLoading(false);
      return;
    }

    const controller = new AbortController();
    const timerId = setTimeout(async () => {
      setIsLoading(true);

      try {
        const nextMetadata = await fetchLinkMetadata(normalizedUrl, controller.signal);

        if (!controller.signal.aborted) {
          setMetadata(nextMetadata);
        }
      } finally {
        if (!controller.signal.aborted) {
          setIsLoading(false);
        }
      }
    }, 350);

    return () => {
      clearTimeout(timerId);
      controller.abort();
    };
  }, [normalizedUrl, platform]);

  return {
    isLoading,
    metadata,
    normalizedUrl,
    platform,
  };
}
