import React from 'react';
import { View, ActivityIndicator } from 'react-native';
import { Redirect } from 'expo-router';
import { useAuth } from '@/lib/auth';
import { colors } from '@/design/tokens';

export default function Index() {
  const { session, profile, loading } = useAuth();

  if (loading) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.bg }}>
        <ActivityIndicator color={colors.ink} size="large" />
      </View>
    );
  }

  if (!session) return <Redirect href="/(auth)/welcome" />;
  if (!profile) return <Redirect href="/onboarding" />;
  return <Redirect href="/(app)/discover" />;
}
