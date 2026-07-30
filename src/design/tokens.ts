/**
 * Design tokens — style néo-brutaliste pour Patati.
 * Couleurs pétantes, ombres noires dures (pas de flou), bords épais, formes plates.
 */

export const colors = {
  // Fond
  bg: '#FFF6E9',
  bgAlt: '#FFFFFF',

  // Encre / bords / texte
  ink: '#111111',

  // Couleurs pétantes
  yellow: '#FFD400',
  pink: '#FF3E8F',
  blue: '#2B57FF',
  green: '#00C853',
  purple: '#7B4DFF',
  orange: '#FF6A2B',

  // Neutres
  white: '#FFFFFF',
  grey100: '#F1EEE6',
  grey200: '#E3DFD4',
  grey400: '#B9B3A4',
  grey600: '#6F6A5E',

  // Sémantique
  success: '#00C853',
  danger: '#FF3E5C',
  warning: '#FFD400',
} as const;

// Une langue = une couleur, pour repérer vite les pastilles de langue dans toute l'app.
export const languageColors: Record<string, string> = {
  fr: colors.blue,
  en: colors.pink,
  nl: colors.orange,
  es: colors.yellow,
  it: colors.green,
  de: colors.purple,
};

export const spacing = {
  xxs: 4,
  xs: 8,
  sm: 12,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
} as const;

// Formes plates : pas d'arrondis prononcés. 0 par défaut, un léger 4/8 pour les
// contrôles de saisie afin de rester lisible sans perdre l'esprit "flat".
export const radii = {
  none: 0,
  sm: 4,
  md: 8,
  pill: 999,
} as const;

// Bords épais caractéristiques du néo-brutalisme.
export const borders = {
  thin: 2,
  base: 3,
  thick: 4,
} as const;

// Décalages d'ombre "dure" (utilisés par <HardShadow /> — pas de blur, couleur pleine).
export const shadowOffsets = {
  sm: 4,
  md: 6,
  lg: 8,
} as const;

export const fontFamily = {
  display: 'ArchivoBlack_400Regular',
  body: 'SpaceGrotesk_400Regular',
  bodyMedium: 'SpaceGrotesk_500Medium',
  bodyBold: 'SpaceGrotesk_700Bold',
} as const;

export const fontSize = {
  xs: 12,
  sm: 14,
  md: 16,
  lg: 20,
  xl: 26,
  xxl: 34,
} as const;

export const tokens = {
  colors,
  languageColors,
  spacing,
  radii,
  borders,
  shadowOffsets,
  fontFamily,
  fontSize,
};

export type ColorName = keyof typeof colors;
