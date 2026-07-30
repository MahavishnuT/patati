import React, { useState } from 'react';
import { View, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Text, Button, TextField, ScreenContainer } from '@/components';
import { supabase } from '@/lib/supabase';
import { colors, spacing } from '@/design/tokens';

export default function Login() {
  const { t } = useTranslation();
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const onSubmit = async () => {
    setError(null);
    setLoading(true);
    const { error: signInError } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
    setLoading(false);
    if (signInError) {
      setError(t('auth.genericError'));
      return;
    }
    router.replace('/');
  };

  return (
    <ScreenContainer padded={false}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
        <SafeAreaView style={{ flex: 1 }}>
          <ScrollView contentContainerStyle={{ padding: spacing.lg, flexGrow: 1, justifyContent: 'center' }}>
            <Text variant="title" style={{ marginBottom: spacing.lg }}>
              {t('auth.loginTitle')}
            </Text>

            <TextField
              label={t('auth.email')}
              autoCapitalize="none"
              keyboardType="email-address"
              value={email}
              onChangeText={setEmail}
            />
            <TextField label={t('auth.password')} secureTextEntry value={password} onChangeText={setPassword} />

            {error && (
              <Text variant="caption" style={{ color: colors.danger, marginBottom: spacing.sm }}>
                {error}
              </Text>
            )}

            <Button label={t('auth.login')} tone="blue" fullWidth loading={loading} onPress={onSubmit} />

            <View style={{ flexDirection: 'row', justifyContent: 'center', marginTop: spacing.lg, gap: 4 }}>
              <Text variant="body">{t('auth.noAccount')}</Text>
              <Text variant="bodyBold" style={{ color: colors.blue }} onPress={() => router.replace('/(auth)/signup')}>
                {t('auth.createOne')}
              </Text>
            </View>
          </ScrollView>
        </SafeAreaView>
      </KeyboardAvoidingView>
    </ScreenContainer>
  );
}
