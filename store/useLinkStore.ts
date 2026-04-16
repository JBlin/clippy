import { create } from 'zustand';

import { createDemoLinks } from '@/features/links/data/demoLinks';
import { clearStoredLinks, loadStoredLinks, saveStoredLinks } from '@/features/links/services/linkStorage';
import type { LinkFormValues, LinkItem } from '@/features/links/types';
import { createLinkId } from '@/utils/id';
import { normalizeUrl } from '@/utils/url';

interface LinkStoreState {
  items: LinkItem[];
  isHydrated: boolean;
  hydrate: () => Promise<void>;
  addLink: (values: LinkFormValues) => Promise<LinkItem>;
  updateLink: (id: string, values: LinkFormValues) => Promise<LinkItem | null>;
  deleteLink: (id: string) => Promise<void>;
  toggleFavorite: (id: string) => Promise<void>;
  seedDemoData: () => Promise<void>;
  resetAllData: () => Promise<void>;
}

function orderByLatest(items: LinkItem[]) {
  return [...items].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

async function persistItems(items: LinkItem[]) {
  const ordered = orderByLatest(items);
  await saveStoredLinks(ordered);
  return ordered;
}

async function commitItems(set: (partial: Partial<LinkStoreState>) => void, items: LinkItem[]) {
  const ordered = await persistItems(items);
  set({ items: ordered });
  return ordered;
}

export const useLinkStore = create<LinkStoreState>((set, get) => ({
  items: [],
  isHydrated: false,
  hydrate: async () => {
    if (get().isHydrated) {
      return;
    }

    try {
      const stored = await loadStoredLinks();

      set({
        items: orderByLatest(stored),
        isHydrated: true,
      });
    } catch (error) {
      console.error('Failed to hydrate links', error);
      set({
        items: [],
        isHydrated: true,
      });
    }
  },
  addLink: async (values) => {
    try {
      const timestamp = new Date().toISOString();
      const item: LinkItem = {
        id: createLinkId(),
        originalUrl: normalizeUrl(values.originalUrl),
        detectedPlatform: values.detectedPlatform,
        title: values.title.trim(),
        thumbnailUrl: values.thumbnailUrl,
        summary: values.summary.trim(),
        category: values.category,
        tags: values.tags,
        memo: values.memo.trim(),
        isFavorite: values.isFavorite,
        createdAt: timestamp,
        updatedAt: timestamp,
      };

      await commitItems(set, [item, ...get().items]);
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

      const updated: LinkItem = {
        ...current,
        originalUrl: normalizeUrl(values.originalUrl),
        detectedPlatform: values.detectedPlatform,
        title: values.title.trim(),
        thumbnailUrl: values.thumbnailUrl,
        summary: values.summary.trim(),
        category: values.category,
        tags: values.tags,
        memo: values.memo.trim(),
        isFavorite: values.isFavorite,
        updatedAt: new Date().toISOString(),
      };

      await commitItems(
        set,
        get().items.map((item) => (item.id === id ? updated : item)),
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
      await commitItems(set, nextItems);
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

      await commitItems(set, nextItems);
    } catch (error) {
      console.error('Failed to toggle favorite', error);
      throw new Error('즐겨찾기 상태를 변경하지 못했어요.');
    }
  },
  seedDemoData: async () => {
    try {
      const items = createDemoLinks();
      await commitItems(set, items);
      set({ isHydrated: true });
    } catch (error) {
      console.error('Failed to seed demo links', error);
      throw new Error('데모 데이터를 불러오지 못했어요.');
    }
  },
  resetAllData: async () => {
    try {
      await clearStoredLinks();
      set({ items: [], isHydrated: true });
    } catch (error) {
      console.error('Failed to reset links', error);
      throw new Error('데이터를 초기화하지 못했어요.');
    }
  },
}));
