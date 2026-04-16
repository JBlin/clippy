import { useEffect, useMemo, useRef, useState } from 'react';

import { DEFAULT_LINK_CATEGORIES } from '@/constants/linkOptions';
import type { LinkFormValues, LinkItem } from '@/features/links/types';
import { useLinkMetadata } from '@/hooks/useLinkMetadata';
import { deriveLinkPreview } from '@/utils/url';

function getFallbackCategory(categories: string[]) {
  return categories[0] ?? DEFAULT_LINK_CATEGORIES[DEFAULT_LINK_CATEGORIES.length - 1] ?? '기타';
}

function resolveCategory(category: string | undefined, categories: string[]) {
  const nextCategory = category?.trim();

  if (nextCategory && categories.includes(nextCategory)) {
    return nextCategory;
  }

  return getFallbackCategory(categories);
}

function createEmptyForm(categories: string[]): LinkFormValues {
  return {
    originalUrl: '',
    detectedPlatform: 'Other',
    title: '',
    thumbnailUrl: '',
    summary: '',
    category: getFallbackCategory(categories),
    tags: [],
    memo: '',
    isFavorite: false,
  };
}

function toFormValues(item: LinkItem | undefined, categories: string[]): LinkFormValues {
  if (!item) {
    return createEmptyForm(categories);
  }

  return {
    originalUrl: item.originalUrl,
    detectedPlatform: item.detectedPlatform,
    title: item.title,
    thumbnailUrl: item.thumbnailUrl,
    summary: item.summary,
    category: resolveCategory(item.category, categories),
    tags: item.tags,
    memo: item.memo,
    isFavorite: item.isFavorite,
  };
}

export function useLinkFormState(categories: string[], item?: LinkItem) {
  const resolvedCategories = useMemo(
    () => (categories.length ? categories : [...DEFAULT_LINK_CATEGORIES]),
    [categories],
  );
  const initialValues = useMemo(() => toFormValues(item, resolvedCategories), [item, resolvedCategories]);
  const [form, setForm] = useState<LinkFormValues>(initialValues);
  const initialPreview = useMemo(() => deriveLinkPreview(item?.originalUrl ?? ''), [item?.originalUrl]);
  const preview = useMemo(() => deriveLinkPreview(form.originalUrl), [form.originalUrl]);
  const { isLoading: isEnriching, metadata } = useLinkMetadata(form.originalUrl);
  const autoTitleRef = useRef(initialPreview.title);
  const autoCategoryRef = useRef(resolveCategory(initialPreview.suggestedCategory, resolvedCategories));
  const autoSummaryRef = useRef(initialPreview.summaryTemplate);
  const autoThumbnailRef = useRef(initialPreview.thumbnailUrl);

  useEffect(() => {
    setForm(initialValues);
    autoTitleRef.current = initialPreview.title;
    autoCategoryRef.current = resolveCategory(initialPreview.suggestedCategory, resolvedCategories);
    autoSummaryRef.current = initialPreview.summaryTemplate;
    autoThumbnailRef.current = initialPreview.thumbnailUrl;
  }, [
    initialPreview.suggestedCategory,
    initialPreview.summaryTemplate,
    initialPreview.thumbnailUrl,
    initialPreview.title,
    initialValues,
    resolvedCategories,
  ]);

  useEffect(() => {
    const suggestedCategory = resolveCategory(preview.suggestedCategory, resolvedCategories);

    setForm((current) => {
      const nextTitle =
        !current.title || current.title === autoTitleRef.current ? preview.title : current.title;
      const nextCategory =
        !current.category ||
        current.category === autoCategoryRef.current ||
        !resolvedCategories.includes(current.category)
          ? suggestedCategory
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
    autoCategoryRef.current = suggestedCategory;
    autoSummaryRef.current = preview.summaryTemplate;
    autoThumbnailRef.current = preview.thumbnailUrl;
  }, [
    preview.detectedPlatform,
    preview.suggestedCategory,
    preview.summaryTemplate,
    preview.thumbnailUrl,
    preview.title,
    resolvedCategories,
  ]);

  useEffect(() => {
    setForm((current) => {
      if (resolvedCategories.includes(current.category)) {
        return current;
      }

      return {
        ...current,
        category: getFallbackCategory(resolvedCategories),
      };
    });
  }, [resolvedCategories]);

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
    const nextEmptyForm = createEmptyForm(resolvedCategories);
    setForm(nextEmptyForm);
    autoTitleRef.current = '';
    autoCategoryRef.current = nextEmptyForm.category;
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
