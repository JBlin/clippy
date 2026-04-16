import AsyncStorage from '@react-native-async-storage/async-storage';

import { STORAGE_KEYS } from '@/constants/storage';
import type { LinkItem } from '@/features/links/types';

function parseArray<T>(raw: string | null): T[] {
  if (!raw) {
    return [];
  }

  try {
    const parsed = JSON.parse(raw) as T[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export async function loadStoredLinks() {
  const raw = await AsyncStorage.getItem(STORAGE_KEYS.links);
  return parseArray<LinkItem>(raw);
}

export async function saveStoredLinks(items: LinkItem[]) {
  await AsyncStorage.setItem(STORAGE_KEYS.links, JSON.stringify(items));
}

export async function clearStoredLinks() {
  await AsyncStorage.removeItem(STORAGE_KEYS.links);
}

export async function loadStoredCategories() {
  const raw = await AsyncStorage.getItem(STORAGE_KEYS.categories);

  return parseArray<string>(raw)
    .map((category) => category.trim())
    .filter(Boolean);
}

export async function saveStoredCategories(categories: string[]) {
  await AsyncStorage.setItem(STORAGE_KEYS.categories, JSON.stringify(categories));
}

export async function clearStoredCategories() {
  await AsyncStorage.removeItem(STORAGE_KEYS.categories);
}
