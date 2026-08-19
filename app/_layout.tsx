import React, { useCallback, useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { Slot } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import * as SplashScreen from 'expo-splash-screen';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { useFonts, ArchivoBlack_400Regular } from '@expo-google-fonts/archivo-black';
import {
  SpaceGrotesk_400Regular,
  SpaceGrotesk_500Medium,
  SpaceGrotesk_700Bold,
} from '@expo-google-fonts/space-grotesk';

import { AuthProvider } from '@/lib/auth';
import { initI18n } from '@/i18n';
import { AnimatedSplash } from '@/components';

// Garde le splash natif (écran de démarrage OS) affiché tant que les polices
// et les traductions ne sont pas prêtes — évite un flash de contenu non stylé.
SplashScreen.preventAutoHideAsync().catch(() => {});

export default function RootLayout() {
  const [i18nReady, setI18nReady] = useState(false);
  const [showAnimatedSplash, setShowAnimatedSplash] = useState(true);
  const [fontsLoaded] = useFonts({
    ArchivoBlack_400Regular,
    SpaceGrotesk_400Regular,
    SpaceGrotesk_500Medium,
    SpaceGrotesk_700Bold,
  });

  useEffect(() => {
    initI18n().then(() => setI18nReady(true));
  }, []);

  const appReady = fontsLoaded && i18nReady;

  useEffect(() => {
    if (appReady) {
      // Bascule immédiatement du splash natif (statique) vers notre écran
      // d'ouverture animé en JS, sans flash entre les deux.
      SplashScreen.hideAsync().catch(() => {});
    }
  }, [appReady]);

  const onAnimatedSplashFinish = useCallback(() => {
    setShowAnimatedSplash(false);
  }, []);

  return (
    <SafeAreaProvider>
      <AuthProvider>
        <StatusBar style={showAnimatedSplash ? 'light' : 'dark'} />
        {appReady && <Slot />}
        {(!appReady || showAnimatedSplash) && (
          <View style={StyleSheet.absoluteFill}>
            {appReady && <AnimatedSplash onFinish={onAnimatedSplashFinish} />}
          </View>
        )}
      </AuthProvider>
    </SafeAreaProvider>
  );
}
