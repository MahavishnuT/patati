import React, { useState } from 'react';
import { View, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Text, Button, TextField, ScreenContainer } from '@/components';
import { supabase } from '@/lib/supabase';
import { colors, spacing } from '@/design/tokens';

export default function Signup() {
  const { t } = useTranslation();
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [checkEmail, setCheckEmail] = useState(false);

  const onSubmit = async () => {
    setError(null);
    if (password !== confirmPassword) {
      setError(t('auth.passwordsDontMatch'));
      return;
    }
    setLoading(true);
    const { data, error: signUpError } = await supabase.auth.signUp({ email: email.trim(), password });
    setLoading(false);
    if (signUpError) {
      setError(t('auth.genericError'));
      return;
    }
    if (!data.session) {
      // Confirmation email requise selon la configuration du projet Supabase.
      setCheckEmail(true);
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
              {t('auth.signupTitle')}
            </Text>

            {checkEmail ? (
              <Text variant="body">{t('auth.checkEmail')}</Text>
            ) : (
              <>
                <TextField
                  label={t('auth.email')}
                  autoCapitalize="none"
                  keyboardType="email-address"
                  value={email}
                  onChangeText={setEmail}
                />
                <TextField label={t('auth.password')} secureTextEntry value={password} onChangeText={setPassword} />
                <TextField
                  label={t('auth.confirmPassword')}
                  secureTextEntry
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                />

                {error && (
                  <Text variant="caption" style={{ color: colors.danger, marginBottom: spacing.sm }}>
                    {error}
                  </Text>
                )}

                <Button label={t('auth.signup')} tone="pink" fullWidth loading={loading} onPress={onSubmit} />
              </>
            )}

            <View style={{ flexDirection: 'row', justifyContent: 'center', marginTop: spacing.lg, gap: 4 }}>
              <Text variant="body">{t('auth.hasAccount')}</Text>
              <Text variant="bodyBold" style={{ color: colors.blue }} onPress={() => router.replace('/(auth)/login')}>
                {t('auth.signInInstead')}
              </Text>
            </View>
          </ScrollView>
        </SafeAreaView>
      </KeyboardAvoidingView>
    </ScreenContainer>
  );
}
