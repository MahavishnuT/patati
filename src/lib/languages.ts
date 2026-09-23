/**
 * Langues proposées pour "je parle" / "je veux apprendre".
 * Liste volontairement plus large que les 5 langues de l'interface (fr/en/nl/es/it),
 * pertinente pour le contexte multilingue bruxellois.
 */
export type LanguageCode =
  | 'fr' | 'nl' | 'en' | 'de' | 'es' | 'it' | 'pt' | 'ar' | 'tr'
  | 'pl' | 'ro' | 'el' | 'ru' | 'uk' | 'zh' | 'ja' | 'ko' | 'sw';

export const LANGUAGES: { code: LanguageCode; nativeName: string }[] = [
  { code: 'fr', nativeName: 'Français' },
  { code: 'nl', nativeName: 'Nederlands' },
  { code: 'en', nativeName: 'English' },
  { code: 'de', nativeName: 'Deutsch' },
  { code: 'es', nativeName: 'Español' },
  { code: 'it', nativeName: 'Italiano' },
  { code: 'pt', nativeName: 'Português' },
  { code: 'ar', nativeName: 'العربية' },
  { code: 'tr', nativeName: 'Türkçe' },
  { code: 'pl', nativeName: 'Polski' },
  { code: 'ro', nativeName: 'Română' },
  { code: 'el', nativeName: 'Ελληνικά' },
  { code: 'ru', nativeName: 'Русский' },
  { code: 'uk', nativeName: 'Українська' },
  { code: 'zh', nativeName: '中文' },
  { code: 'ja', nativeName: '日本語' },
  { code: 'ko', nativeName: '한국어' },
  { code: 'sw', nativeName: 'Kiswahili' },
];

export function languageLabel(code: string): string {
  const found = LANGUAGES.find((l) => l.code === code);
  return found ? found.nativeName : code;
}
