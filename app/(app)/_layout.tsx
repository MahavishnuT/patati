import React from 'react';
import { Tabs, Redirect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '@/lib/auth';
import { colors, borders } from '@/design/tokens';

const ICON_SIZE = 30;

export default function AppLayout() {
  const { t } = useTranslation();
  const { session, profile, loading } = useAuth();
  const insets = useSafeAreaInsets();

  if (loading) return null;
  if (!session) return <Redirect href="/(auth)/welcome" />;
  if (!profile) return <Redirect href="/onboarding" />;

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.ink,
        tabBarInactiveTintColor: colors.grey400,
        tabBarStyle: {
          borderTopWidth: borders.thick,
          borderTopColor: colors.ink,
          height: 72 + insets.bottom,
          paddingTop: 10,
          paddingBottom: Math.max(insets.bottom, 14),
        },
        tabBarLabelStyle: { fontFamily: 'SpaceGrotesk_700Bold', fontSize: 12 },
      }}
    >
      <Tabs.Screen
        name="discover"
        options={{
          title: t('discover.title'),
          tabBarIcon: ({ color, focused }) => (
            <Ionicons name={focused ? 'people' : 'people-outline'} size={ICON_SIZE} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="matches"
        options={{
          title: t('matches.title'),
          tabBarIcon: ({ color, focused }) => (
            <Ionicons name={focused ? 'chatbubbles' : 'chatbubbles-outline'} size={ICON_SIZE} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: t('profile.title'),
          tabBarIcon: ({ color, focused }) => (
            <Ionicons name={focused ? 'person-circle' : 'person-circle-outline'} size={ICON_SIZE} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
