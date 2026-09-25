import React, { useCallback, useState } from 'react';
import { View, FlatList, RefreshControl } from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Pressable } from 'react-native';
import { Text, Card, Avatar, TopBar, EmptyState, ScreenContainer } from '@/components';
import { colors, spacing, borders } from '@/design/tokens';
import { useAuth } from '@/lib/auth';
import { getMyMatches } from '@/lib/data';
import type { MatchWithProfile } from '@/types/models';

export default function MatchesList() {
  const { t } = useTranslation();
  const router = useRouter();
  const { session } = useAuth();
  const [matches, setMatches] = useState<MatchWithProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    if (!session?.user.id) return;
    const data = await getMyMatches(session.user.id);
    setMatches(data);
  }, [session]);

  useFocusEffect(
    useCallback(() => {
      setLoading(true);
      load().finally(() => setLoading(false));
    }, [load]),
  );

  const onRefresh = async () => {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  };

  return (
    <ScreenContainer padded={false}>
      <TopBar title={t('matches.title')} tone={colors.pink} />
      <FlatList
        data={matches}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ padding: spacing.md, gap: spacing.sm, flexGrow: 1 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        ListEmptyComponent={
          !loading ? (
            <EmptyState icon="heart-outline" title={t('matches.noMatches')} subtitle={t('matches.noMatchesSubtitle')} />
          ) : null
        }
        renderItem={({ item }) => (
          <Pressable onPress={() => router.push(`/(app)/matches/${item.id}`)} style={{ position: 'relative' }}>
            <Card offset={4}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm }}>
                <Avatar uri={item.otherProfile.photo_url} name={item.otherProfile.first_name} color={colors.orange} />
                <View style={{ flex: 1 }}>
                  <Text variant="subtitle">{item.otherProfile.first_name}</Text>
                </View>
              </View>
            </Card>
            {item.hasUnread && (
              <View
                accessibilityLabel={t('matches.newMessage')}
                style={{
                  position: 'absolute',
                  top: -6,
                  right: -6,
                  width: 18,
                  height: 18,
                  borderRadius: 9,
                  backgroundColor: colors.danger,
                  borderWidth: borders.base,
                  borderColor: colors.ink,
                }}
              />
            )}
          </Pressable>
        )}
      />
    </ScreenContainer>
  );
}
