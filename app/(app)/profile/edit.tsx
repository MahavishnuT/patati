import React, { useState } from 'react';
import { View, ScrollView, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { Text, Button, TextField, Chip, Avatar, ScreenContainer } from '@/components';
import { colors, spacing, languageColors } from '@/design/tokens';
import { LANGUAGES, LanguageCode } from '@/lib/languages';
import { useAuth } from '@/lib/auth';
import { upsertProfile, uploadAvatar } from '@/lib/data';

export default function EditProfile() {
  const { t } = useTranslation();
  const router = useRouter();
  const { session, profile, refreshProfile } = useAuth();

  const [firstName, setFirstName] = useState(profile?.first_name ?? '');
  const [bio, setBio] = useState(profile?.bio ?? '');
  const [speaks, setSpeaks] = useState<LanguageCode[]>((profile?.languages_spoken as LanguageCode[]) ?? []);
  const [learns, setLearns] = useState<LanguageCode[]>((profile?.languages_learning as LanguageCode[]) ?? []);
  const [photoUri, setPhotoUri] = useState<string | null>(profile?.photo_url ?? null);
  const [photoMimeType, setPhotoMimeType] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const toggle = (list: LanguageCode[], setList: (v: LanguageCode[]) => void, code: LanguageCode) => {
    setList(list.includes(code) ? list.filter((c) => c !== code) : [...list, code]);
  };

  const pickPhoto = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) return;
    const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['images'], allowsEditing: true, aspect: [1, 1], quality: 0.8 });
    if (!result.canceled && result.assets[0]) {
      setPhotoUri(result.assets[0].uri);
      setPhotoMimeType(result.assets[0].mimeType ?? null);
    }
  };

  const onSave = async () => {
    if (!session?.user.id) return;
    setSaving(true);
    setError(null);
    try {
      let photoUrl = profile?.photo_url ?? null;
      if (photoUri && photoUri !== profile?.photo_url) {
        photoUrl = await uploadAvatar(session.user.id, photoUri, photoMimeType);
      }
      await upsertProfile({
        id: session.user.id,
        first_name: firstName.trim(),
        bio: bio.trim(),
        languages_spoken: speaks,
        languages_learning: learns,
        photo_url: photoUrl,
      });
      await refreshProfile();
      router.back();
    } catch {
      setError(t('common.error'));
    } finally {
      setSaving(false);
    }
  };

  return (
    <ScreenContainer padded={false}>
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: spacing.md,
          borderBottomWidth: 3,
          borderBottomColor: colors.ink,
        }}
      >
        <Pressable onPress={() => router.back()} accessibilityRole="button" accessibilityLabel={t('common.close')}>
          <Ionicons name="close" size={26} color={colors.ink} />
        </Pressable>
        <Text variant="subtitle">{t('profile.editTitle')}</Text>
        <View style={{ width: 26 }} />
      </View>

      <ScrollView contentContainerStyle={{ padding: spacing.md, gap: spacing.md }}>
        <View style={{ alignItems: 'center' }}>
          <Avatar uri={photoUri} name={firstName} size={100} />
          <Button label={t('onboarding.addPhoto')} tone="white" size="sm" onPress={pickPhoto} style={{ marginTop: spacing.xs }} />
        </View>

        <TextField label={t('onboarding.nameLabel')} value={firstName} onChangeText={setFirstName} />
        <TextField label={t('onboarding.bioLabel')} value={bio} onChangeText={setBio} multiline style={{ height: 80, textAlignVertical: 'top' }} />

        <Text variant="subtitle">{t('profile.speaks')}</Text>
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

        <Text variant="subtitle">{t('profile.learns')}</Text>
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

        {error && (
          <Text variant="caption" style={{ color: colors.danger, textAlign: 'center' }}>
            {error}
          </Text>
        )}

        <Button label={t('common.save')} tone="pink" fullWidth loading={saving} onPress={onSave} />
      </ScrollView>
    </ScreenContainer>
  );
}
