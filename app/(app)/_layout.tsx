import React from 'react';
import { Tabs, Redirect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/lib/auth';
import { colors, borders } from '@/design/tokens';

export default function AppLayout() {
  const { t } = useTranslation();
  const { session, profile, loading } = useAuth();

  if (loading) return null;
  if (!session) return <Redirect href="/(auth)/welcome" />;
  if (!profile) return <Redirect href="/onboarding" />;

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.ink,
        tabBarInactiveTintColor: colors.grey400,
        tabBarStyle: { borderTopWidth: borders.thick, borderTopColor: colors.ink, height: 64, paddingTop: 6 },
        tabBarLabelStyle: { fontFamily: 'SpaceGrotesk_700Bold', fontSize: 11 },
      }}
    >
      <Tabs.Screen
        name="discover"
        options={{
          title: t('discover.title'),
          tabBarIcon: ({ color, size }) => <Ionicons name="people-outline" size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="matches"
        options={{
          title: t('matches.title'),
          tabBarIcon: ({ color, size }) => <Ionicons name="chatbubbles-outline" size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: t('profile.title'),
          tabBarIcon: ({ color, size }) => <Ionicons name="person-circle-outline" size={size} color={color} />,
        }}
      />
    </Tabs>
  );
}
