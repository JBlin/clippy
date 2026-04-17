import { useRouter } from 'expo-router';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { radius, spacing, textStyle, useThemePreference } from '@/constants/theme';
import { useLinkStore } from '@/store/useLinkStore';

function QuickAction({
  label,
  onPress,
  primary = false,
}: {
  label: string;
  onPress: () => void;
  primary?: boolean;
}) {
  const { colors } = useThemePreference();

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => ({
        alignItems: 'center',
        backgroundColor: primary ? colors.accent : colors.surface,
        borderColor: primary ? colors.accent : colors.border,
        borderRadius: radius.md,
        borderWidth: 1,
        flex: 1,
        opacity: pressed ? 0.88 : 1,
        paddingHorizontal: 16,
        paddingVertical: 14,
      })}
    >
      <Text
        style={{
          ...textStyle('700'),
          color: primary ? colors.surface : colors.text,
          fontSize: 14,
        }}
      >
        {label}
      </Text>
    </Pressable>
  );
}

function StatBlock({ label, value }: { label: string; value: number }) {
  const { colors } = useThemePreference();

  return (
    <View
      style={{
        backgroundColor: colors.surface,
        borderColor: colors.border,
        borderRadius: radius.lg,
        borderWidth: 1,
        flex: 1,
        gap: 6,
        padding: 16,
      }}
    >
      <Text style={{ ...textStyle('600'), color: colors.textMuted, fontSize: 12 }}>{label}</Text>
      <Text style={{ ...textStyle('800'), color: colors.text, fontSize: 24 }}>{value}</Text>
    </View>
  );
}

export default function HomeScreen() {
  const router = useRouter();
  const { colors, isDarkMode, toggleColorMode } = useThemePreference();
  const items = useLinkStore((state) => state.items);
  const categories = useLinkStore((state) => state.categories);
  const favorites = items.filter((item) => item.isFavorite).length;
  const recentItems = items.slice(0, 5);

  return (
    <SafeAreaView edges={['top']} style={{ backgroundColor: colors.background, flex: 1 }}>
      <ScrollView
        contentContainerStyle={{
          gap: spacing.md,
          padding: spacing.md,
          paddingBottom: spacing.xxl,
        }}
        showsVerticalScrollIndicator={false}
      >
        <View
          style={{
            backgroundColor: colors.surface,
            borderColor: colors.border,
            borderRadius: radius.lg,
            borderWidth: 1,
            gap: 12,
            padding: 20,
          }}
        >
          <View
            style={{
              alignItems: 'center',
              flexDirection: 'row',
              justifyContent: 'space-between',
            }}
          >
            <Text style={{ ...textStyle('800'), color: colors.text, fontSize: 28 }}>Clippy</Text>
            <Pressable
              onPress={toggleColorMode}
              style={({ pressed }) => ({
                backgroundColor: colors.surface,
                borderColor: colors.border,
                borderRadius: radius.pill,
                borderWidth: 1,
                opacity: pressed ? 0.88 : 1,
                paddingHorizontal: 12,
                paddingVertical: 8,
              })}
            >
              <Text style={{ ...textStyle('700'), color: colors.text, fontSize: 12 }}>
                {isDarkMode ? '라이트 모드' : '다크 모드'}
              </Text>
            </Pressable>
          </View>

          <Text style={{ ...textStyle('700'), color: colors.text, fontSize: 18, lineHeight: 28 }}>
            {'링크는 빠르게 저장하고.\n필요할 때 바로 다시 찾으세요.'}
          </Text>
          <Text style={{ ...textStyle('400'), color: colors.textMuted, fontSize: 14, lineHeight: 22 }}>
            기존 흰 화면 문제를 추적하는 동안 웹 렌더링을 안정화하기 위해 홈 화면을 단순화한 상태입니다.
          </Text>
        </View>

        <View style={{ flexDirection: 'row', gap: 12 }}>
          <StatBlock label="전체 링크" value={items.length} />
          <StatBlock label="즐겨찾기" value={favorites} />
          <StatBlock label="카테고리" value={categories.length} />
        </View>

        <View style={{ flexDirection: 'row', gap: 12 }}>
          <QuickAction label="링크 추가" onPress={() => router.push('/add')} primary />
          <QuickAction label="보관함 열기" onPress={() => router.push('/library')} />
        </View>

        <View
          style={{
            backgroundColor: colors.surface,
            borderColor: colors.border,
            borderRadius: radius.lg,
            borderWidth: 1,
            gap: 12,
            padding: 18,
          }}
        >
          <Text style={{ ...textStyle('800'), color: colors.text, fontSize: 16 }}>최근 링크</Text>

          {recentItems.length ? (
            recentItems.map((item) => (
              <Pressable
                key={item.id}
                onPress={() => router.push(`/link/${item.id}`)}
                style={({ pressed }) => ({
                  backgroundColor: colors.background,
                  borderRadius: radius.md,
                  opacity: pressed ? 0.9 : 1,
                  padding: 14,
                })}
              >
                <Text numberOfLines={1} style={{ ...textStyle('700'), color: colors.text, fontSize: 14 }}>
                  {item.title}
                </Text>
                <Text
                  numberOfLines={1}
                  style={{ ...textStyle('400'), color: colors.textMuted, fontSize: 12, marginTop: 4 }}
                >
                  {item.originalUrl}
                </Text>
              </Pressable>
            ))
          ) : (
            <Text style={{ ...textStyle('400'), color: colors.textMuted, fontSize: 14 }}>
              아직 링크가 없습니다. 위 버튼으로 첫 링크를 추가해 보세요.
            </Text>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
