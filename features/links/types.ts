import type { LinkCategory, LinkPlatform } from '@/constants/linkOptions';

export interface LinkItem {
  id: string;
  originalUrl: string;
  detectedPlatform: LinkPlatform;
  title: string;
  thumbnailUrl: string;
  summary: string;
  category: LinkCategory;
  tags: string[];
  memo: string;
  isFavorite: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface LinkFormValues {
  originalUrl: string;
  detectedPlatform: LinkPlatform;
  title: string;
  thumbnailUrl: string;
  summary: string;
  category: LinkCategory;
  tags: string[];
  memo: string;
  isFavorite: boolean;
}

export interface DerivedLinkPreview {
  normalizedUrl: string;
  detectedPlatform: LinkPlatform;
  title: string;
  thumbnailUrl: string;
  embedUrl: string;
  suggestedCategory: LinkCategory;
  hostnameLabel: string;
  summaryTemplate: string;
}

export interface LinkMetadata {
  title?: string;
  thumbnailUrl?: string;
  embedUrl?: string;
}

export interface LinkQueryOptions {
  platform?: LinkPlatform | 'all';
  category?: LinkCategory | 'all';
  search?: string;
  sort?: 'latest' | 'oldest' | 'favorites' | 'platform' | 'category';
}
