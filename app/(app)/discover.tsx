import React, { useCallback, useState } from 'react';
import { View, FlatList, RefreshControl } from 'react-native';
import { useFocusEffect } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Text, Card, Chip, Avatar, Button, TopBar, EmptyState, ScreenContainer } from '@/components';
import { colors, spacing, languageColors } from '@/design/tokens';
import { languageLabel } from '@/lib/languages';
import { useAuth } from '@/lib/auth';
import { getCompatibleProfiles, proposeMatch, commonPracticeLanguages } from '@/lib/data';
import type { Profile } from '@/types/models';

export default function Discover() {
  const { t } = useTranslation();
  const { session, profile } = useAuth();
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [proposedIds, setProposedIds] = useState<Set<string>>(new Set());

  const load = useCallback(async () => {
    if (!session?.user.id) return;
    const data = await getCompatibleProfiles(session.user.id);
    setProfiles(data);
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

  const onPropose = async (target: Profile) => {
    if (!session?.user.id) return;
    setProposedIds((prev) => new Set(prev).add(target.id));
    try {
      await proposeMatch(session.user.id, target.id);
    } catch {
      setProposedIds((prev) => {
        const next = new Set(prev);
        next.delete(target.id);
        return next;
      });
    }
  };

  return (
    <ScreenContainer padded={false}>
      <TopBar title={t('discover.title')} tone={colors.blue} />
      <View style={{ paddingHorizontal: spacing.md, paddingTop: spacing.sm }}>
        <Text variant="body" style={{ color: colors.grey600 }}>
          {t('discover.subtitle')}
        </Text>
      </View>

      <FlatList
        data={profiles}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ padding: spacing.md, gap: spacing.md, flexGrow: 1 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        ListEmptyComponent={
          !loading ? (
            <EmptyState icon="cafe-outline" title={t('discover.noProfiles')} subtitle={t('discover.noProfilesSubtitle')} tone={colors.yellow} />
          ) : null
        }
        renderItem={({ item }) => {
          const alreadyProposed = proposedIds.has(item.id);
          const common = profile ? commonPracticeLanguages(profile, item) : [];
          return (
            <Card>
              <View style={{ flexDirection: 'row', gap: spacing.sm }}>
                <Avatar uri={item.photo_url} name={item.first_name} size={64} color={colors.green} />
                <View style={{ flex: 1 }}>
                  <Text variant="subtitle">{item.first_name}</Text>
                  {!!item.bio && (
                    <Text variant="caption" numberOfLines={2} style={{ color: colors.grey600 }}>
                      {item.bio}
                    </Text>
                  )}
                </View>
              </View>

              <View style={{ marginTop: spacing.sm, gap: spacing.xxs }}>
                <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing.xxs, alignItems: 'center' }}>
                  <Text variant="caption" style={{ fontFamily: 'SpaceGrotesk_700Bold' }}>
                    {t('discover.speaksLabel')}:
                  </Text>
                  {item.languages_spoken.map((code) => (
                    <Chip key={code} label={languageLabel(code)} small color={languageColors[code] ?? colors.blue} />
                  ))}
                </View>
                <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing.xxs, alignItems: 'center' }}>
                  <Text variant="caption" style={{ fontFamily: 'SpaceGrotesk_700Bold' }}>
                    {t('discover.learnsLabel')}:
                  </Text>
                  {item.languages_learning.map((code) => (
                    <Chip key={code} label={languageLabel(code)} small color={languageColors[code] ?? colors.pink} />
                  ))}
                </View>
              </View>

              {common.length > 0 && (
                <Text variant="caption" style={{ marginTop: spacing.xs, color: colors.grey600 }}>
                  {t('discover.commonLanguage', { language: common.map(languageLabel).join(', ') })}
                </Text>
              )}

              <View style={{ marginTop: spacing.sm }}>
                <Button
                  label={alreadyProposed ? t('discover.matchProposed') : t('discover.proposeMatch')}
                  tone={alreadyProposed ? 'white' : 'green'}
                  disabled={alreadyProposed}
                  onPress={() => onPropose(item)}
                />
              </View>
            </Card>
          );
        }}
      />
    </ScreenContainer>
  );
}
