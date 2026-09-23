import React, { useState } from 'react';
import { View, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import * as ImagePicker from 'expo-image-picker';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Text, Button, TextField, Chip, Avatar, ScreenContainer } from '@/components';
import { colors, spacing, languageColors } from '@/design/tokens';
import { LANGUAGES, LanguageCode } from '@/lib/languages';
import { useAuth } from '@/lib/auth';
import { upsertProfile, uploadAvatar } from '@/lib/data';

const STEPS = ['identity', 'speaks', 'learns', 'photo'] as const;
type Step = (typeof STEPS)[number];

export default function Onboarding() {
  const { t } = useTranslation();
  const router = useRouter();
  const { session, refreshProfile } = useAuth();

  const [stepIndex, setStepIndex] = useState(0);
  const step: Step = STEPS[stepIndex];

  const [firstName, setFirstName] = useState('');
  const [bio, setBio] = useState('');
  const [speaks, setSpeaks] = useState<LanguageCode[]>([]);
  const [learns, setLearns] = useState<LanguageCode[]>([]);
  const [photoUri, setPhotoUri] = useState<string | null>(null);
  const [photoMimeType, setPhotoMimeType] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const toggle = (list: LanguageCode[], setList: (v: LanguageCode[]) => void, code: LanguageCode) => {
    setList(list.includes(code) ? list.filter((c) => c !== code) : [...list, code]);
  };

  const pickPhoto = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) return;
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });
    if (!result.canceled && result.assets[0]) {
      setPhotoUri(result.assets[0].uri);
      setPhotoMimeType(result.assets[0].mimeType ?? null);
    }
  };

  const goNext = () => {
    setError(null);
    if (step === 'identity' && !firstName.trim()) {
      setError(t('onboarding.minOneLanguage'));
      return;
    }
    if (step === 'speaks' && speaks.length === 0) {
      setError(t('onboarding.minOneLanguage'));
      return;
    }
    if (step === 'learns' && learns.length === 0) {
      setError(t('onboarding.minOneLanguage'));
      return;
    }
    if (stepIndex < STEPS.length - 1) {
      setStepIndex(stepIndex + 1);
    } else {
      void finish();
    }
  };

  const finish = async () => {
    if (!session?.user.id) return;
    setSaving(true);
    setError(null);
    try {
      let photoUrl: string | null = null;
      if (photoUri) {
        photoUrl = await uploadAvatar(session.user.id, photoUri, photoMimeType);
      }
      await upsertProfile({
        id: session.user.id,
        first_name: firstName.trim(),
        bio: bio.trim(),
        city: 'Brussels',
        photo_url: photoUrl,
        languages_spoken: speaks,
        languages_learning: learns,
      });
      await refreshProfile();
      router.replace('/(app)/discover');
    } catch {
      setError(t('common.error'));
    } finally {
      setSaving(false);
    }
  };

  return (
    <ScreenContainer padded={false}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
        <SafeAreaView style={{ flex: 1 }}>
          <View style={{ flexDirection: 'row', gap: spacing.xxs, paddingHorizontal: spacing.lg, paddingTop: spacing.md }}>
            {STEPS.map((s, i) => (
              <View
                key={s}
                style={{
                  flex: 1,
                  height: 8,
                  backgroundColor: i <= stepIndex ? colors.ink : colors.grey200,
                  borderRadius: 2,
                }}
              />
            ))}
          </View>

          <ScrollView contentContainerStyle={{ padding: spacing.lg, flexGrow: 1 }}>
            {step === 'identity' && (
              <>
                <Text variant="title" style={{ marginBottom: spacing.xs }}>
                  {t('onboarding.nameLabel')}
                </Text>
                <TextField placeholder={t('onboarding.namePlaceholder')} value={firstName} onChangeText={setFirstName} />
                <Text variant="subtitle" style={{ marginTop: spacing.md, marginBottom: spacing.xxs }}>
                  {t('onboarding.bioLabel')}
                </Text>
                <TextField
                  placeholder={t('onboarding.bioPlaceholder')}
                  value={bio}
                  onChangeText={setBio}
                  multiline
                  numberOfLines={3}
                  style={{ height: 90, textAlignVertical: 'top' }}
                />
              </>
            )}

            {step === 'speaks' && (
              <>
                <Text variant="title" style={{ marginBottom: spacing.xxs }}>
                  {t('onboarding.speaksTitle')}
                </Text>
                <Text variant="body" style={{ color: colors.grey600, marginBottom: spacing.md }}>
                  {t('onboarding.speaksSubtitle')}
                </Text>
                <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing.xs }}>
                  {LANGUAGES.map((lang) => (
                    <Chip
                      key={lang.code}
                      label={lang.nativeName}
                      selected={speaks.includes(lang.code)}
                      color={languageColors[lang.code] ?? colors.blue}
                      onPress={() => toggle(speaks, setSpeaks, lang.code)}
                    />
                  ))}
                </View>
              </>
            )}

            {step === 'learns' && (
              <>
                <Text variant="title" style={{ marginBottom: spacing.xxs }}>
                  {t('onboarding.learnsTitle')}
                </Text>
                <Text variant="body" style={{ color: colors.grey600, marginBottom: spacing.md }}>
                  {t('onboarding.learnsSubtitle')}
                </Text>
                <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing.xs }}>
                  {LANGUAGES.map((lang) => (
                    <Chip
                      key={lang.code}
                      label={lang.nativeName}
                      selected={learns.includes(lang.code)}
                      color={languageColors[lang.code] ?? colors.pink}
                      onPress={() => toggle(learns, setLearns, lang.code)}
                    />
                  ))}
                </View>
              </>
            )}

            {step === 'photo' && (
              <View style={{ alignItems: 'center' }}>
                <Text variant="title" style={{ marginBottom: spacing.xxs, textAlign: 'center' }}>
                  {t('onboarding.photoTitle')}
                </Text>
                <Text variant="body" style={{ color: colors.grey600, marginBottom: spacing.md, textAlign: 'center' }}>
                  {t('onboarding.photoSubtitle')}
                </Text>
                <View style={{ marginBottom: spacing.md }}>
                  <Avatar uri={photoUri} name={firstName} size={120} />
                </View>
                <Button label={t('onboarding.addPhoto')} tone="yellow" onPress={pickPhoto} />
              </View>
            )}

            {error && (
              <Text variant="caption" style={{ color: colors.danger, marginTop: spacing.md, textAlign: 'center' }}>
                {error}
              </Text>
            )}
          </ScrollView>

          <View style={{ padding: spacing.lg }}>
            <Button
              label={step === 'photo' ? t('onboarding.finish') : t('common.continue')}
              tone="pink"
              fullWidth
              loading={saving}
              onPress={goNext}
            />
          </View>
        </SafeAreaView>
      </KeyboardAvoidingView>
    </ScreenContainer>
  );
}
