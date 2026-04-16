import { create } from 'zustand';

import { DEFAULT_LINK_CATEGORIES } from '@/constants/linkOptions';
import { createDemoLinks } from '@/features/links/data/demoLinks';
import {
  clearStoredLinks,
  loadStoredCategories,
  loadStoredLinks,
  saveStoredCategories,
  saveStoredLinks,
} from '@/features/links/services/linkStorage';
import type { LinkFormValues, LinkItem } from '@/features/links/types';
import { createLinkId } from '@/utils/id';
import { normalizeUrl } from '@/utils/url';

interface LinkStoreState {
  items: LinkItem[];
  categories: string[];
  isHydrated: boolean;
  hydrate: () => Promise<void>;
  addLink: (values: LinkFormValues) => Promise<LinkItem>;
  updateLink: (id: string, values: LinkFormValues) => Promise<LinkItem | null>;
  deleteLink: (id: string) => Promise<void>;
  toggleFavorite: (id: string) => Promise<void>;
  seedDemoData: () => Promise<void>;
  resetAllData: () => Promise<void>;
  addCategory: (name: string) => Promise<string>;
  updateCategory: (currentName: string, nextName: string) => Promise<string>;
  deleteCategory: (name: string) => Promise<void>;
  reorderCategories: (nextCategories: string[]) => Promise<void>;
}

function orderByLatest(items: LinkItem[]) {
  return [...items].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

function sanitizeCategoryName(name: string) {
  return name.trim();
}

function dedupeCategories(categories: string[]) {
  const seen = new Set<string>();

  return categories.filter((category) => {
    const normalized = sanitizeCategoryName(category);

    if (!normalized || seen.has(normalized)) {
      return false;
    }

    seen.add(normalized);
    return true;
  });
}

function ensureCategories(categories: string[], items: LinkItem[] = []) {
  const merged = dedupeCategories([
    ...categories,
    ...items.map((item) => sanitizeCategoryName(item.category)),
  ]);

  return merged.length ? merged : [...DEFAULT_LINK_CATEGORIES];
}

function getFallbackCategory(categories: string[], excludedCategory?: string) {
  const nextCategories = categories.filter((category) => category !== excludedCategory);
  return nextCategories[0] ?? DEFAULT_LINK_CATEGORIES[DEFAULT_LINK_CATEGORIES.length - 1] ?? '기타';
}

async function persistState(items: LinkItem[], categories: string[]) {
  const orderedItems = orderByLatest(items);
  const nextCategories = ensureCategories(categories, orderedItems);

  await Promise.all([saveStoredLinks(orderedItems), saveStoredCategories(nextCategories)]);

  return {
    items: orderedItems,
    categories: nextCategories,
  };
}

async function commitState(
  set: (partial: Partial<LinkStoreState>) => void,
  items: LinkItem[],
  categories: string[],
) {
  const nextState = await persistState(items, categories);
  set(nextState);
  return nextState;
}

export const useLinkStore = create<LinkStoreState>((set, get) => ({
  items: [],
  categories: [...DEFAULT_LINK_CATEGORIES],
  isHydrated: false,
  hydrate: async () => {
    if (get().isHydrated) {
      return;
    }

    try {
      const [storedItems, storedCategories] = await Promise.all([loadStoredLinks(), loadStoredCategories()]);
      const orderedItems = orderByLatest(storedItems);
      const categories = ensureCategories(storedCategories, orderedItems);

      set({
        items: orderedItems,
        categories,
        isHydrated: true,
      });
    } catch (error) {
      console.error('Failed to hydrate links', error);
      set({
        items: [],
        categories: [...DEFAULT_LINK_CATEGORIES],
        isHydrated: true,
      });
    }
  },
  addLink: async (values) => {
    try {
      const timestamp = new Date().toISOString();
      const category = sanitizeCategoryName(values.category) || getFallbackCategory(get().categories);
      const item: LinkItem = {
        id: createLinkId(),
        originalUrl: normalizeUrl(values.originalUrl),
        detectedPlatform: values.detectedPlatform,
        title: values.title.trim(),
        thumbnailUrl: values.thumbnailUrl,
        summary: values.summary.trim(),
        category,
        tags: values.tags,
        memo: values.memo.trim(),
        isFavorite: values.isFavorite,
        createdAt: timestamp,
        updatedAt: timestamp,
      };

      await commitState(set, [item, ...get().items], [...get().categories, category]);
      return item;
    } catch (error) {
      console.error('Failed to add link', error);
      throw new Error('링크를 저장하지 못했어요.');
    }
  },
  updateLink: async (id, values) => {
    try {
      const current = get().items.find((item) => item.id === id);

      if (!current) {
        return null;
      }

      const category = sanitizeCategoryName(values.category) || getFallbackCategory(get().categories);
      const updated: LinkItem = {
        ...current,
        originalUrl: normalizeUrl(values.originalUrl),
        detectedPlatform: values.detectedPlatform,
        title: values.title.trim(),
        thumbnailUrl: values.thumbnailUrl,
        summary: values.summary.trim(),
        category,
        tags: values.tags,
        memo: values.memo.trim(),
        isFavorite: values.isFavorite,
        updatedAt: new Date().toISOString(),
      };

      await commitState(
        set,
        get().items.map((item) => (item.id === id ? updated : item)),
        [...get().categories, category],
      );

      return updated;
    } catch (error) {
      console.error('Failed to update link', error);
      throw new Error('링크를 수정하지 못했어요.');
    }
  },
  deleteLink: async (id) => {
    try {
      const nextItems = get().items.filter((item) => item.id !== id);
      await commitState(set, nextItems, get().categories);
    } catch (error) {
      console.error('Failed to delete link', error);
      throw new Error('링크를 삭제하지 못했어요.');
    }
  },
  toggleFavorite: async (id) => {
    try {
      const nextItems = get().items.map((item) =>
        item.id === id
          ? {
              ...item,
              isFavorite: !item.isFavorite,
              updatedAt: new Date().toISOString(),
            }
          : item,
      );

      await commitState(set, nextItems, get().categories);
    } catch (error) {
      console.error('Failed to toggle favorite', error);
      throw new Error('즐겨찾기 상태를 변경하지 못했어요.');
    }
  },
  seedDemoData: async () => {
    try {
      const items = createDemoLinks();
      const categories = ensureCategories(
        [...get().categories, ...items.map((item) => item.category)],
        items,
      );

      await commitState(set, items, categories);
      set({ isHydrated: true });
    } catch (error) {
      console.error('Failed to seed demo links', error);
      throw new Error('데모 데이터를 불러오지 못했어요.');
    }
  },
  resetAllData: async () => {
    try {
      await clearStoredLinks();
      await saveStoredCategories([...DEFAULT_LINK_CATEGORIES]);
      set({
        items: [],
        categories: [...DEFAULT_LINK_CATEGORIES],
        isHydrated: true,
      });
    } catch (error) {
      console.error('Failed to reset links', error);
      throw new Error('데이터를 초기화하지 못했어요.');
    }
  },
  addCategory: async (name) => {
    const nextName = sanitizeCategoryName(name);

    if (!nextName) {
      throw new Error('카테고리 이름을 입력해 주세요.');
    }

    if (get().categories.includes(nextName)) {
      throw new Error('이미 같은 이름의 카테고리가 있어요.');
    }

    await commitState(set, get().items, [...get().categories, nextName]);
    return nextName;
  },
  updateCategory: async (currentName, nextName) => {
    const trimmedCurrentName = sanitizeCategoryName(currentName);
    const trimmedNextName = sanitizeCategoryName(nextName);

    if (!trimmedCurrentName || !get().categories.includes(trimmedCurrentName)) {
      throw new Error('수정할 카테고리를 찾지 못했어요.');
    }

    if (!trimmedNextName) {
      throw new Error('카테고리 이름을 입력해 주세요.');
    }

    if (trimmedCurrentName === trimmedNextName) {
      return trimmedCurrentName;
    }

    if (get().categories.includes(trimmedNextName)) {
      throw new Error('이미 같은 이름의 카테고리가 있어요.');
    }

    const updatedAt = new Date().toISOString();
    const nextItems = get().items.map((item) =>
      item.category === trimmedCurrentName
        ? {
            ...item,
            category: trimmedNextName,
            updatedAt,
          }
        : item,
    );
    const nextCategories = get().categories.map((category) =>
      category === trimmedCurrentName ? trimmedNextName : category,
    );

    await commitState(set, nextItems, nextCategories);
    return trimmedNextName;
  },
  deleteCategory: async (name) => {
    const trimmedName = sanitizeCategoryName(name);
    const currentCategories = get().categories;

    if (!trimmedName || !currentCategories.includes(trimmedName)) {
      throw new Error('삭제할 카테고리를 찾지 못했어요.');
    }

    if (currentCategories.length <= 1) {
      throw new Error('카테고리는 최소 1개 이상 필요해요.');
    }

    const fallbackCategory = getFallbackCategory(currentCategories, trimmedName);
    const updatedAt = new Date().toISOString();
    const nextItems = get().items.map((item) =>
      item.category === trimmedName
        ? {
            ...item,
            category: fallbackCategory,
            updatedAt,
          }
        : item,
    );
    const nextCategories = currentCategories.filter((category) => category !== trimmedName);

    await commitState(set, nextItems, nextCategories);
  },
  reorderCategories: async (nextCategories) => {
    const currentCategories = get().categories;
    const orderedCategories = dedupeCategories([
      ...nextCategories.filter((category) => currentCategories.includes(category)),
      ...currentCategories.filter((category) => !nextCategories.includes(category)),
    ]);

    await commitState(set, get().items, orderedCategories);
  },
}));
