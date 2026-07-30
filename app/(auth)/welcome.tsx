import React from 'react';
import { View } from 'react-native';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Text, Button, ScreenContainer } from '@/components';
import { colors, spacing } from '@/design/tokens';
import { HardShadow } from '@/design/HardShadow';

export default function Welcome() {
  const { t } = useTranslation();
  const router = useRouter();

  return (
    <ScreenContainer padded={false}>
      <SafeAreaView style={{ flex: 1, justifyContent: 'space-between', padding: spacing.lg }}>
        <View style={{ marginTop: spacing.xxl }}>
          <View
            style={{
              alignSelf: 'flex-start',
              backgroundColor: colors.pink,
              paddingHorizontal: spacing.sm,
              paddingVertical: spacing.xxs,
              borderWidth: 3,
              borderColor: colors.ink,
              marginBottom: spacing.lg,
            }}
          >
            <Text variant="caption" style={{ color: colors.white, fontFamily: 'SpaceGrotesk_700Bold' }}>
              {t('common.brussels').toUpperCase()} 🇧🇪
            </Text>
          </View>
          <Text variant="display" style={{ marginBottom: spacing.sm }}>
            {t('onboarding.welcomeTitle')}
          </Text>
          <Text variant="body" style={{ color: colors.grey600 }}>
            {t('onboarding.welcomeSubtitle')}
          </Text>
        </View>

        <HardShadow backgroundColor={colors.yellow} offset={8}>
          <View style={{ padding: spacing.lg, flexDirection: 'row', flexWrap: 'wrap', gap: spacing.xs }}>
            {['🗣️', '☕', '🤝', '🇫🇷', '🇳🇱', '🇬🇧', '🇪🇸', '🇮🇹'].map((emoji) => (
              <Text key={emoji} style={{ fontSize: 28 }}>
                {emoji}
              </Text>
            ))}
          </View>
        </HardShadow>

        <View style={{ gap: spacing.sm }}>
          <Button label={t('onboarding.getStarted')} tone="pink" fullWidth onPress={() => router.push('/(auth)/signup')} />
          <Button label={t('auth.login')} tone="white" fullWidth onPress={() => router.push('/(auth)/login')} />
        </View>
      </SafeAreaView>
    </ScreenContainer>
  );
}
