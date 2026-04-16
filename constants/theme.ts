import { Platform } from 'react-native';

import type { LinkPlatform } from '@/constants/linkOptions';

export const colors = {
  background: '#F4F7F9',
  surface: '#FFFFFF',
  surfaceMuted: '#EEF3F6',
  border: '#D9E2E8',
  text: '#14202B',
  textMuted: '#5F6E7C',
  textSoft: '#7C8B99',
  accent: '#1F7A61',
  accentMuted: '#E7F5F0',
  info: '#2563EB',
  infoMuted: '#E8F0FF',
  warning: '#C07A12',
  warningMuted: '#FFF5E7',
  danger: '#C63D3D',
  dangerMuted: '#FDECEC',
  success: '#0E9F6E',
  successMuted: '#E8FFF5',
  shadow: 'rgba(20, 32, 43, 0.08)',
};

export const spacing = {
  xs: 6,
  sm: 10,
  md: 16,
  lg: 20,
  xl: 24,
  xxl: 32,
};

export const radius = {
  sm: 10,
  md: 16,
  lg: 22,
  pill: 999,
};

export const platformColors: Record<
  LinkPlatform,
  { background: string; border: string; text: string }
> = {
  YouTube: { background: '#FFF1F1', border: '#F7C7C7', text: '#B42318' },
  Instagram: { background: '#FFF0F7', border: '#F7C5DD', text: '#B42372' },
  X: { background: '#EEF2F6', border: '#D0D8E0', text: '#1F2937' },
  TikTok: { background: '#EEFDF8', border: '#C8F2E2', text: '#0F766E' },
  Blog: { background: '#F4F5FF', border: '#D6DAFF', text: '#4C51BF' },
  News: { background: '#EFF6FF', border: '#CDE1FF', text: '#1D4ED8' },
  Shopping: { background: '#FFF7E8', border: '#F7DEAF', text: '#B45309' },
  Other: { background: '#F3F4F6', border: '#D1D5DB', text: '#4B5563' },
};

export const shadows = {
  card: {
    shadowColor: '#14202B',
    shadowOpacity: 0.08,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 8 },
    elevation: 3,
  },
};

const webFontFamily =
  'Pretendard, "Apple SD Gothic Neo", "Noto Sans KR", "Malgun Gothic", sans-serif';

const webFonts = {
  regular: webFontFamily,
  medium: webFontFamily,
  semibold: webFontFamily,
  bold: webFontFamily,
  extraBold: webFontFamily,
} as const;

const nativeFonts = {
  regular: 'Pretendard-Regular',
  medium: 'Pretendard-Medium',
  semibold: 'Pretendard-SemiBold',
  bold: 'Pretendard-Bold',
  extraBold: 'Pretendard-ExtraBold',
} as const;

export const fontFamily = Platform.OS === 'web' ? webFonts : nativeFonts;

export type AppFontWeight = '400' | '500' | '600' | '700' | '800';

export function textStyle(weight: AppFontWeight = '400') {
  if (Platform.OS === 'web') {
    return { fontFamily: webFontFamily, fontWeight: weight };
  }

  switch (weight) {
    case '800':
      return { fontFamily: fontFamily.extraBold };
    case '700':
      return { fontFamily: fontFamily.bold };
    case '600':
      return { fontFamily: fontFamily.semibold };
    case '500':
      return { fontFamily: fontFamily.medium };
    case '400':
    default:
      return { fontFamily: fontFamily.regular };
  }
}
