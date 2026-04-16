import { useEffect, useMemo, useRef, useState } from 'react';

import type { LinkFormValues, LinkItem } from '@/features/links/types';
import { useLinkMetadata } from '@/hooks/useLinkMetadata';
import { deriveLinkPreview } from '@/utils/url';

const EMPTY_FORM: LinkFormValues = {
  originalUrl: '',
  detectedPlatform: 'Other',
  title: '',
  thumbnailUrl: '',
  summary: '',
  category: '기타',
  tags: [],
  memo: '',
  isFavorite: false,
};

function toFormValues(item?: LinkItem): LinkFormValues {
  if (!item) {
    return EMPTY_FORM;
  }

  return {
    originalUrl: item.originalUrl,
    detectedPlatform: item.detectedPlatform,
    title: item.title,
    thumbnailUrl: item.thumbnailUrl,
    summary: item.summary,
    category: item.category,
    tags: item.tags,
    memo: item.memo,
    isFavorite: item.isFavorite,
  };
}

export function useLinkFormState(item?: LinkItem) {
  const initialValues = useMemo(() => toFormValues(item), [item]);
  const [form, setForm] = useState<LinkFormValues>(initialValues);
  const initialPreview = useMemo(
    () => deriveLinkPreview(item?.originalUrl ?? ''),
    [item?.originalUrl],
  );
  const preview = useMemo(() => deriveLinkPreview(form.originalUrl), [form.originalUrl]);
  const { isLoading: isEnriching, metadata } = useLinkMetadata(form.originalUrl);
  const autoTitleRef = useRef(initialPreview.title);
  const autoCategoryRef = useRef(initialPreview.suggestedCategory);
  const autoSummaryRef = useRef(initialPreview.summaryTemplate);
  const autoThumbnailRef = useRef(initialPreview.thumbnailUrl);

  useEffect(() => {
    setForm(initialValues);
    autoTitleRef.current = initialPreview.title;
    autoCategoryRef.current = initialPreview.suggestedCategory;
    autoSummaryRef.current = initialPreview.summaryTemplate;
    autoThumbnailRef.current = initialPreview.thumbnailUrl;
  }, [
    initialPreview.suggestedCategory,
    initialPreview.summaryTemplate,
    initialPreview.thumbnailUrl,
    initialPreview.title,
    initialValues,
  ]);

  useEffect(() => {
    setForm((current) => {
      const nextTitle =
        !current.title || current.title === autoTitleRef.current ? preview.title : current.title;
      const nextCategory =
        !current.category || current.category === autoCategoryRef.current
          ? preview.suggestedCategory
          : current.category;
      const nextSummary =
        !current.summary || current.summary === autoSummaryRef.current
          ? preview.summaryTemplate
          : current.summary;
      const nextThumbnail =
        !current.thumbnailUrl || current.thumbnailUrl === autoThumbnailRef.current
          ? preview.thumbnailUrl
          : current.thumbnailUrl;

      return {
        ...current,
        detectedPlatform: preview.detectedPlatform,
        thumbnailUrl: nextThumbnail,
        title: nextTitle,
        category: nextCategory,
        summary: nextSummary,
      };
    });
    autoTitleRef.current = preview.title;
    autoCategoryRef.current = preview.suggestedCategory;
    autoSummaryRef.current = preview.summaryTemplate;
    autoThumbnailRef.current = preview.thumbnailUrl;
  }, [
    preview.detectedPlatform,
    preview.suggestedCategory,
    preview.summaryTemplate,
    preview.thumbnailUrl,
    preview.title,
  ]);

  useEffect(() => {
    if (!metadata) {
      return;
    }

    setForm((current) => {
      const nextTitle =
        metadata.title && (!current.title || current.title === autoTitleRef.current)
          ? metadata.title
          : current.title;
      const nextThumbnail =
        metadata.thumbnailUrl &&
        (!current.thumbnailUrl || current.thumbnailUrl === autoThumbnailRef.current)
          ? metadata.thumbnailUrl
          : current.thumbnailUrl;

      return {
        ...current,
        thumbnailUrl: nextThumbnail,
        title: nextTitle,
      };
    });

    if (metadata.title) {
      autoTitleRef.current = metadata.title;
    }

    if (metadata.thumbnailUrl) {
      autoThumbnailRef.current = metadata.thumbnailUrl;
    }
  }, [metadata]);

  function updateField<Key extends keyof LinkFormValues>(key: Key, value: LinkFormValues[Key]) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  function resetForm() {
    setForm(EMPTY_FORM);
    autoTitleRef.current = '';
    autoCategoryRef.current = '기타';
    autoSummaryRef.current = '';
    autoThumbnailRef.current = '';
  }

  return {
    form,
    isEnriching,
    preview,
    updateField,
    resetForm,
  };
}
