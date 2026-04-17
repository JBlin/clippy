import { useEffect, useMemo, useState } from 'react';

import type { LinkMetadata } from '@/features/links/types';
import { detectPlatform, fetchLinkMetadata, normalizeUrl, safeParseUrl } from '@/utils/url';

const metadataCache = new Map<string, LinkMetadata | null>();

interface UseLinkMetadataOptions {
  enabled?: boolean;
  debounceMs?: number;
}

export function useLinkMetadata(input: string, options: UseLinkMetadataOptions = {}) {
  const normalizedUrl = useMemo(() => normalizeUrl(input), [input]);
  const parsedUrl = useMemo(() => safeParseUrl(normalizedUrl), [normalizedUrl]);
  const platform = useMemo(() => detectPlatform(normalizedUrl), [normalizedUrl]);
  const [metadata, setMetadata] = useState<LinkMetadata | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const enabled = options.enabled ?? true;
  const debounceMs = options.debounceMs ?? 350;

  useEffect(() => {
    if (metadataCache.has(normalizedUrl)) {
      setMetadata(metadataCache.get(normalizedUrl) ?? null);
    } else {
      setMetadata(null);
    }

    if (
      !enabled ||
      !normalizedUrl ||
      !parsedUrl ||
      (!parsedUrl.hostname.includes('.') && parsedUrl.hostname !== 'localhost')
    ) {
      setIsLoading(false);
      return;
    }

    if (metadataCache.has(normalizedUrl)) {
      setIsLoading(false);
      return;
    }

    const controller = new AbortController();
    const timerId = setTimeout(async () => {
      setIsLoading(true);

      try {
        const nextMetadata = await fetchLinkMetadata(normalizedUrl, controller.signal);

        if (!controller.signal.aborted) {
          metadataCache.set(normalizedUrl, nextMetadata);
          setMetadata(nextMetadata);
        }
      } catch {
        if (!controller.signal.aborted) {
          metadataCache.set(normalizedUrl, null);
          setMetadata(null);
        }
      } finally {
        if (!controller.signal.aborted) {
          setIsLoading(false);
        }
      }
    }, debounceMs);

    return () => {
      clearTimeout(timerId);
      controller.abort();
    };
  }, [debounceMs, enabled, normalizedUrl, parsedUrl, platform]);

  return {
    isLoading,
    metadata,
    normalizedUrl,
    platform,
  };
}
