import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import * as Localization from 'expo-localization';
import AsyncStorage from '@react-native-async-storage/async-storage';

import fr from './locales/fr.json';
import en from './locales/en.json';
import nl from './locales/nl.json';
import es from './locales/es.json';
import it from './locales/it.json';

export const SUPPORTED_LANGUAGES = ['fr', 'en', 'nl', 'es', 'it'] as const;
export type SupportedLanguage = (typeof SUPPORTED_LANGUAGES)[number];

const LANGUAGE_STORAGE_KEY = 'patati.appLanguage';

const resources = {
  fr: { translation: fr },
  en: { translation: en },
  nl: { translation: nl },
  es: { translation: es },
  it: { translation: it },
};

function detectDeviceLanguage(): SupportedLanguage {
  const deviceTag = Localization.getLocales()[0]?.languageCode ?? 'fr';
  return (SUPPORTED_LANGUAGES as readonly string[]).includes(deviceTag)
    ? (deviceTag as SupportedLanguage)
    : 'fr';
}

/** Initialise i18next : restaure la langue choisie par l'utilisateur, sinon détecte la langue du téléphone (repli sur le français). */
export async function initI18n() {
  let initialLanguage: SupportedLanguage = detectDeviceLanguage();

  try {
    const stored = await AsyncStorage.getItem(LANGUAGE_STORAGE_KEY);
    if (stored && (SUPPORTED_LANGUAGES as readonly string[]).includes(stored)) {
      initialLanguage = stored as SupportedLanguage;
    }
  } catch {
    // Le stockage local n'est pas critique ici : on continue avec la langue détectée.
  }

  if (!i18n.isInitialized) {
    await i18n.use(initReactI18next).init({
      resources,
      lng: initialLanguage,
      fallbackLng: 'fr',
      interpolation: { escapeValue: false },
      compatibilityJSON: 'v4',
    });
  }

  return i18n;
}

export async function setAppLanguage(lang: SupportedLanguage) {
  await i18n.changeLanguage(lang);
  try {
    await AsyncStorage.setItem(LANGUAGE_STORAGE_KEY, lang);
  } catch {
    // Pas bloquant si l'écriture échoue.
  }
}

export default i18n;
