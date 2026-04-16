import { useEffect } from 'react';
import { ActivityIndicator, Platform, Text, View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useFonts } from 'expo-font';

import { colors, fontFamily, textStyle } from '@/constants/theme';
import { useLinkStore } from '@/store/useLinkStore';

export default function RootLayout() {
  const hydrate = useLinkStore((state) => state.hydrate);
  const isHydrated = useLinkStore((state) => state.isHydrated);
  const shouldLoadNativeFonts = Platform.OS !== 'web';
  const [fontsLoaded, fontError] = useFonts(
    shouldLoadNativeFonts
      ? {
          'Pretendard-Regular': require('pretendard/dist/public/static/alternative/Pretendard-Regular.ttf'),
          'Pretendard-Medium': require('pretendard/dist/public/static/alternative/Pretendard-Medium.ttf'),
          'Pretendard-SemiBold': require('pretendard/dist/public/static/alternative/Pretendard-SemiBold.ttf'),
          'Pretendard-Bold': require('pretendard/dist/public/static/alternative/Pretendard-Bold.ttf'),
          'Pretendard-ExtraBold': require('pretendard/dist/public/static/alternative/Pretendard-ExtraBold.ttf'),
        }
      : {},
  );

  useEffect(() => {
    hydrate();
  }, [hydrate]);

  const ready = isHydrated && (!shouldLoadNativeFonts || fontsLoaded || Boolean(fontError));

  if (!ready) {
    return (
      <GestureHandlerRootView style={{ flex: 1 }}>
        <SafeAreaProvider>
          <StatusBar style="dark" />
          <View
            style={{
              alignItems: 'center',
              backgroundColor: colors.background,
              flex: 1,
              gap: 14,
              justifyContent: 'center',
            }}
          >
            <ActivityIndicator color={colors.accent} size="large" />
            <Text style={{ ...textStyle('600'), color: colors.textMuted, fontSize: 14 }}>
              Clippy를 준비하고 있어요.
            </Text>
          </View>
        </SafeAreaProvider>
      </GestureHandlerRootView>
    );
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <StatusBar style="dark" />
        <Stack
          screenOptions={{
            contentStyle: { backgroundColor: colors.background },
            headerShadowVisible: false,
            headerStyle: { backgroundColor: colors.background },
            headerTintColor: colors.text,
            headerTitleStyle: { fontFamily: fontFamily.extraBold },
          }}
        >
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="link/[id]" options={{ title: '링크 상세' }} />
          <Stack.Screen name="link/edit/[id]" options={{ title: '링크 수정' }} />
          <Stack.Screen name="settings/categories" options={{ title: '카테고리 관리' }} />
        </Stack>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
