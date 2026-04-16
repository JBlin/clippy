import { Platform } from 'react-native';

import type { LinkPlatform } from '@/constants/linkOptions';

export const colors = {
  background: '#F6F5FF',
  surface: '#FFFFFF',
  surfaceMuted: '#F1EEFF',
  border: '#DED9FF',
  text: '#1E1B3A',
  textMuted: '#66618D',
  textSoft: '#8A84B3',
  accent: '#5E50FA',
  accentMuted: '#ECE9FF',
  info: '#4F46E5',
  infoMuted: '#ECEBFF',
  warning: '#C07A12',
  warningMuted: '#FFF5E7',
  danger: '#C63D3D',
  dangerMuted: '#FDECEC',
  success: '#0E9F6E',
  successMuted: '#E8FFF5',
  shadow: 'rgba(47, 39, 124, 0.10)',
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
  sm: 8,
  md: 12,
  lg: 14,
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
  Blog: { background: '#F1F0FF', border: '#D8D4FF', text: '#5B50D6' },
  News: { background: '#EEF1FF', border: '#D6DBFF', text: '#4654D8' },
  Shopping: { background: '#FFF7E8', border: '#F7DEAF', text: '#B45309' },
  Other: { background: '#F1EEFF', border: '#D8D1FF', text: '#5E50FA' },
};

export const shadows = {
  card: {
    shadowColor: '#2F277C',
    shadowOpacity: 0.1,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 10 },
    elevation: 4,
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
