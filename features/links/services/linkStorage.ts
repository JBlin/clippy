import AsyncStorage from '@react-native-async-storage/async-storage';

import { STORAGE_KEYS } from '@/constants/storage';
import type { LinkItem } from '@/features/links/types';

export async function loadStoredLinks() {
  const raw = await AsyncStorage.getItem(STORAGE_KEYS.links);

  if (!raw) {
    return [];
  }

  try {
    const parsed = JSON.parse(raw) as LinkItem[];

    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export async function saveStoredLinks(items: LinkItem[]) {
  await AsyncStorage.setItem(STORAGE_KEYS.links, JSON.stringify(items));
}

export async function clearStoredLinks() {
  await AsyncStorage.removeItem(STORAGE_KEYS.links);
}
