import React from 'react';
import { View, ScrollView, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Ionicons } from '@expo/vector-icons';
import { Text, Card, Button, TopBar, ScreenContainer } from '@/components';
import { colors, spacing } from '@/design/tokens';
import { useAuth } from '@/lib/auth';
import { setAppLanguage, SUPPORTED_LANGUAGES } from '@/i18n';
import i18n from '@/i18n';

const LANGUAGE_LABELS: Record<string, string> = {
  fr: 'Français',
  en: 'English',
  nl: 'Nederlands',
  es: 'Español',
  it: 'Italiano',
};

export default function Settings() {
  const { t } = useTranslation();
  const router = useRouter();
  const { signOut } = useAuth();
  const [currentLang, setCurrentLang] = React.useState(i18n.language);

  const onSelectLanguage = async (lang: (typeof SUPPORTED_LANGUAGES)[number]) => {
    await setAppLanguage(lang);
    setCurrentLang(lang);
  };

  return (
    <ScreenContainer padded={false}>
      <TopBar
        title={t('settings.title')}
        tone={colors.purple}
        right={
          <Pressable onPress={() => router.back()} accessibilityRole="button" accessibilityLabel={t('common.back')}>
            <Ionicons name="close" size={24} color={colors.ink} />
          </Pressable>
        }
      />
      <ScrollView contentContainerStyle={{ padding: spacing.md, gap: spacing.md }}>
        <Card>
          <Text variant="subtitle" style={{ marginBottom: spacing.sm }}>
            {t('settings.language')}
          </Text>
          <View style={{ gap: spacing.xs }}>
            {SUPPORTED_LANGUAGES.map((lang) => (
              <Pressable
                key={lang}
                onPress={() => onSelectLanguage(lang)}
                style={{
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  paddingVertical: spacing.xs,
                  paddingHorizontal: spacing.sm,
                  borderWidth: 2,
                  borderColor: colors.ink,
                  borderRadius: 6,
                  backgroundColor: currentLang === lang ? colors.yellow : colors.white,
                }}
              >
                <Text variant="bodyBold">{LANGUAGE_LABELS[lang]}</Text>
                {currentLang === lang && <Ionicons name="checkmark-circle" size={20} color={colors.ink} />}
              </Pressable>
            ))}
          </View>
        </Card>

        <Button label={t('settings.logout')} tone="white" fullWidth onPress={() => signOut()} />
      </ScrollView>
    </ScreenContainer>
  );
}
