/**
 * Langues proposées pour "je parle" / "je veux apprendre".
 * Liste volontairement plus large que les 5 langues de l'interface (fr/en/nl/es/it),
 * pertinente pour le contexte multilingue bruxellois.
 */
export type LanguageCode =
  | 'fr' | 'nl' | 'en' | 'de' | 'es' | 'it' | 'pt' | 'ar' | 'tr'
  | 'pl' | 'ro' | 'el' | 'ru' | 'uk' | 'zh' | 'ja' | 'ko' | 'sw';

export const LANGUAGES: { code: LanguageCode; flag: string; nativeName: string }[] = [
  { code: 'fr', flag: '🇫🇷', nativeName: 'Français' },
  { code: 'nl', flag: '🇳🇱', nativeName: 'Nederlands' },
  { code: 'en', flag: '🇬🇧', nativeName: 'English' },
  { code: 'de', flag: '🇩🇪', nativeName: 'Deutsch' },
  { code: 'es', flag: '🇪🇸', nativeName: 'Español' },
  { code: 'it', flag: '🇮🇹', nativeName: 'Italiano' },
  { code: 'pt', flag: '🇵🇹', nativeName: 'Português' },
  { code: 'ar', flag: '🇸🇦', nativeName: 'العربية' },
  { code: 'tr', flag: '🇹🇷', nativeName: 'Türkçe' },
  { code: 'pl', flag: '🇵🇱', nativeName: 'Polski' },
  { code: 'ro', flag: '🇷🇴', nativeName: 'Română' },
  { code: 'el', flag: '🇬🇷', nativeName: 'Ελληνικά' },
  { code: 'ru', flag: '🇷🇺', nativeName: 'Русский' },
  { code: 'uk', flag: '🇺🇦', nativeName: 'Українська' },
  { code: 'zh', flag: '🇨🇳', nativeName: '中文' },
  { code: 'ja', flag: '🇯🇵', nativeName: '日本語' },
  { code: 'ko', flag: '🇰🇷', nativeName: '한국어' },
  { code: 'sw', flag: '🇰🇪', nativeName: 'Kiswahili' },
];

export function languageLabel(code: string): string {
  const found = LANGUAGES.find((l) => l.code === code);
  return found ? `${found.flag} ${found.nativeName}` : code;
}
