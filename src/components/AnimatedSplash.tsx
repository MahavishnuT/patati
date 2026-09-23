import React, { useEffect, useRef } from 'react';
import { Animated, Easing, StyleSheet, View } from 'react-native';
import { colors, fontFamily } from '@/design/tokens';

type Props = {
  /** Appelé une fois l'animation de sortie terminée — le parent peut démonter ce composant. */
  onFinish: () => void;
};

const BRAND_PINK = 'rgb(255, 62, 143)';

// Petits accents qui gravitent autour du logo — clin d'œil au concept
// (langues + rencontre) sans surcharger l'écran d'ouverture.
const ACCENTS = [
  { emoji: '🗣️', x: -96, y: -64 },
  { emoji: '☕', x: 104, y: -40 },
  { emoji: '🤝', x: -84, y: 74 },
  { emoji: '📍', x: 100, y: 70 },
];

/**
 * Écran d'ouverture animé : fond rose de marque, "Patati" en blanc avec une
 * ombre dure noire (cohérent avec le style néo-brutaliste), une entrée en
 * rebond, quelques accents qui gravitent autour, puis un fondu de sortie.
 */
export function AnimatedSplash({ onFinish }: Props) {
  const logoScale = useRef(new Animated.Value(0.4)).current;
  const logoOpacity = useRef(new Animated.Value(0)).current;
  const logoRotate = useRef(new Animated.Value(-1)).current;
  const taglineOpacity = useRef(new Animated.Value(0)).current;
  const taglineTranslate = useRef(new Animated.Value(10)).current;
  const accentOpacity = useRef(new Animated.Value(0)).current;
  const accentScale = useRef(new Animated.Value(0.5)).current;
  const overlayOpacity = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const sequence = Animated.sequence([
      // 1. Le logo entre en rebondissant, avec une légère rotation "brute".
      Animated.parallel([
        Animated.spring(logoScale, {
          toValue: 1,
          friction: 4.5,
          tension: 140,
          useNativeDriver: true,
        }),
        Animated.timing(logoOpacity, {
          toValue: 1,
          duration: 260,
          easing: Easing.out(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.spring(logoRotate, {
          toValue: 0,
          friction: 5,
          tension: 120,
          useNativeDriver: true,
        }),
      ]),
      // 2. Les accents (emoji) apparaissent en gravitant autour du logo.
      Animated.parallel([
        Animated.timing(accentOpacity, {
          toValue: 1,
          duration: 320,
          easing: Easing.out(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.spring(accentScale, {
          toValue: 1,
          friction: 5,
          tension: 100,
          useNativeDriver: true,
        }),
        Animated.timing(taglineOpacity, {
          toValue: 1,
          duration: 320,
          useNativeDriver: true,
        }),
        Animated.timing(taglineTranslate, {
          toValue: 0,
          duration: 320,
          easing: Easing.out(Easing.quad),
          useNativeDriver: true,
        }),
      ]),
      // 3. Petit temps de pause pour laisser lire "Patati".
      Animated.delay(500),
      // 4. Fondu de sortie de tout l'écran.
      Animated.timing(overlayOpacity, {
        toValue: 0,
        duration: 380,
        easing: Easing.in(Easing.quad),
        useNativeDriver: true,
      }),
    ]);

    sequence.start(({ finished }) => {
      if (finished) onFinish();
    });

    return () => sequence.stop();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const rotateDeg = logoRotate.interpolate({
    inputRange: [-1, 0],
    outputRange: ['-8deg', '0deg'],
  });

  return (
    <Animated.View
      pointerEvents="none"
      style={[styles.overlay, { opacity: overlayOpacity }]}
    >
      <View style={styles.accentLayer}>
        {ACCENTS.map((accent, index) => (
          <Animated.Text
            key={accent.emoji}
            style={[
              styles.accent,
              {
                transform: [
                  { translateX: accent.x },
                  { translateY: accent.y },
                  { scale: accentScale },
                ],
                opacity: accentOpacity,
              },
            ]}
          >
            {accent.emoji}
          </Animated.Text>
        ))}
      </View>

      <Animated.View
        style={{
          opacity: logoOpacity,
          transform: [{ scale: logoScale }, { rotate: rotateDeg }],
        }}
      >
        <View style={styles.logoStack}>
          {/* Ombre dure noire, décalée — même principe que <HardShadow />. */}
          <Animated.Text style={[styles.logoText, styles.logoShadow]}>Patati</Animated.Text>
          <Animated.Text style={[styles.logoText, styles.logoFront]}>Patati</Animated.Text>
        </View>
      </Animated.View>

      <Animated.Text
        style={[
          styles.tagline,
          {
            opacity: taglineOpacity,
            transform: [{ translateY: taglineTranslate }],
          },
        ]}
      >
        Bruxelles 📍
      </Animated.Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFill,
    backgroundColor: BRAND_PINK,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 100,
  },
  accentLayer: {
    ...StyleSheet.absoluteFill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  accent: {
    position: 'absolute',
    fontSize: 30,
  },
  logoStack: {
    position: 'relative',
  },
  logoText: {
    fontFamily: fontFamily.display,
    fontSize: 56,
    letterSpacing: 1,
  },
  logoShadow: {
    position: 'absolute',
    top: 6,
    left: 6,
    color: colors.ink,
  },
  logoFront: {
    color: colors.white,
  },
  tagline: {
    marginTop: 18,
    fontFamily: fontFamily.bodyBold,
    fontSize: 16,
    color: colors.white,
    letterSpacing: 1,
  },
});
