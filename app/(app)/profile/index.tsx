import React from 'react';
import { View, ScrollView, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Ionicons } from '@expo/vector-icons';
import { Text, Card, Chip, Avatar, TopBar, ScreenContainer } from '@/components';
import { colors, spacing, languageColors } from '@/design/tokens';
import { languageLabel } from '@/lib/languages';
import { useAuth } from '@/lib/auth';

export default function ProfileView() {
  const { t } = useTranslation();
  const router = useRouter();
  const { profile } = useAuth();

  if (!profile) return null;

  return (
    <ScreenContainer padded={false}>
      <TopBar
        title={t('profile.title')}
        tone={colors.green}
        right={
          <Pressable onPress={() => router.push('/(app)/profile/settings')} accessibilityRole="button" accessibilityLabel={t('profile.settings')}>
            <Ionicons name="settings" size={24} color={colors.ink} />
          </Pressable>
        }
      />
      <ScrollView contentContainerStyle={{ padding: spacing.md, gap: spacing.md }}>
        <Card>
          <View style={{ alignItems: 'center' }}>
            <Avatar uri={profile.photo_url} name={profile.first_name} size={100} color={colors.yellow} />
            <Text variant="title" style={{ marginTop: spacing.sm }}>
              {profile.first_name}
            </Text>
            <Text variant="caption" style={{ color: colors.grey600 }}>
              📍 {t('common.brussels')}
            </Text>
            <Text variant="body" style={{ marginTop: spacing.xs, textAlign: 'center' }}>
              {profile.bio || t('profile.noBio')}
            </Text>
          </View>
        </Card>

        <Card>
          <Text variant="subtitle" style={{ marginBottom: spacing.xs }}>
            {t('profile.speaks')}
          </Text>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing.xs }}>
            {profile.languages_spoken.map((code) => (
              <Chip key={code} label={languageLabel(code)} color={languageColors[code] ?? colors.blue} />
            ))}
          </View>
        </Card>

        <Card>
          <Text variant="subtitle" style={{ marginBottom: spacing.xs }}>
            {t('profile.learns')}
          </Text>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing.xs }}>
            {profile.languages_learning.map((code) => (
              <Chip key={code} label={languageLabel(code)} color={languageColors[code] ?? colors.pink} />
            ))}
          </View>
        </Card>

        <Pressable onPress={() => router.push('/(app)/profile/edit')}>
          <Card backgroundColor={colors.yellow}>
            <Text variant="bodyBold" style={{ textAlign: 'center' }}>
              {t('profile.editProfile')}
            </Text>
          </Card>
        </Pressable>
      </ScrollView>
    </ScreenContainer>
  );
}
