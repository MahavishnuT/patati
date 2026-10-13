import React, { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withDelay,
  withTiming,
} from 'react-native-reanimated';
import { scheduleOnRN } from 'react-native-worklets';
import { colors, borders, fontFamily } from '@/design/tokens';

type Props = {
  /** Appelé une fois l'animation de sortie terminée — le parent peut démonter ce composant. */
  onFinish: () => void;
};

const BRAND_PINK = 'rgb(255, 62, 143)';
const EASE_OUT = Easing.bezier(0.23, 1, 0.32, 1);

const LETTERS = "Babbel'r".split('');
const LETTER_START = 80;
const LETTER_STAGGER = 60;
const LETTER_DURATION = 350;

const BUBBLES_START = 620;
const BUBBLE_STAGGER = 90;
const BUBBLE_DURATION = 260;

const TAGLINE_DELAY = 1150;
const HOLD_UNTIL = 1900;
const EXIT_DURATION = 300;

// Une bulle par langue de l'app : l'échange de langues en un coup d'œil, sans drapeaux.
// x / y sont des décalages depuis le centre de l'écran.
const BUBBLES = [
  { text: 'Bonjour', x: -150, y: -130, bg: colors.blue, fg: colors.white, tilt: -5 },
  { text: 'Ciao', x: 50, y: -150, bg: colors.green, fg: colors.ink, tilt: 4 },
  { text: 'Hello', x: 25, y: -92, bg: colors.white, fg: colors.ink, tilt: -3 },
  { text: 'Hallo', x: -150, y: 88, bg: colors.orange, fg: colors.ink, tilt: 4 },
  { text: 'Hola', x: 20, y: 112, bg: colors.yellow, fg: colors.ink, tilt: -4 },
];

function Letter({ char, index, reduced }: { char: string; index: number; reduced: boolean }) {
  const progress = useSharedValue(reduced ? 1 : 0);

  useEffect(() => {
    if (reduced) return;
    progress.set(withDelay(LETTER_START + index * LETTER_STAGGER, withTiming(1, { duration: LETTER_DURATION, easing: EASE_OUT })));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const tilt = index % 2 === 0 ? -3 : 3;

  const style = useAnimatedStyle(() => {
    const p = progress.get();
    return {
      opacity: p,
      transform: [{ translateY: (1 - p) * -36 }, { rotate: `${tilt + (1 - p) * (index % 2 === 0 ? -14 : 14)}deg` }, { scale: 0.9 + p * 0.1 }],
    };
  });

  return (
    <Animated.View style={style}>
      <Animated.Text style={[styles.logoText, styles.logoShadow]}>{char}</Animated.Text>
      <Animated.Text style={[styles.logoText, styles.logoFront]}>{char}</Animated.Text>
    </Animated.View>
  );
}

function Bubble({ bubble, index, reduced }: { bubble: (typeof BUBBLES)[number]; index: number; reduced: boolean }) {
  const progress = useSharedValue(reduced ? 1 : 0);

  useEffect(() => {
    if (reduced) return;
    progress.set(withDelay(BUBBLES_START + index * BUBBLE_STAGGER, withTiming(1, { duration: BUBBLE_DURATION, easing: EASE_OUT })));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const style = useAnimatedStyle(() => {
    const p = progress.get();
    return {
      opacity: p,
      transform: [{ translateY: (1 - p) * 14 }, { rotate: `${bubble.tilt}deg` }, { scale: 0.92 + p * 0.08 }],
    };
  });

  return (
    <Animated.View style={[styles.bubbleWrap, { left: bubble.x, top: bubble.y }, style]}>
      <View style={styles.bubbleShadow} />
      <View style={[styles.bubble, { backgroundColor: bubble.bg }]}>
        <Animated.Text style={[styles.bubbleText, { color: bubble.fg }]}>{bubble.text}</Animated.Text>
      </View>
    </Animated.View>
  );
}

/**
 * Écran d'ouverture : fond rose de marque, les lettres de "Babbel'r" tombent une à une
 * avec une ombre dure noire, puis des bulles "bonjour" en cinq langues apparaissent
 * autour, avant un fondu de sortie. Tout tourne sur le thread UI (Reanimated).
 * Avec "réduire les animations", seul le fondu reste.
 */
export function AnimatedSplash({ onFinish }: Props) {
  const reduced = useReducedMotion();
  const overlayOpacity = useSharedValue(1);
  const taglineProgress = useSharedValue(reduced ? 1 : 0);

  useEffect(() => {
    if (!reduced) {
      taglineProgress.set(withDelay(TAGLINE_DELAY, withTiming(1, { duration: 300, easing: EASE_OUT })));
    }
    overlayOpacity.set(
      withDelay(
        reduced ? 700 : HOLD_UNTIL,
        withTiming(0, { duration: EXIT_DURATION, easing: EASE_OUT }, (finished) => {
          if (finished) scheduleOnRN(onFinish);
        }),
      ),
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const overlayStyle = useAnimatedStyle(() => ({ opacity: overlayOpacity.get() }));
  const taglineStyle = useAnimatedStyle(() => ({
    opacity: taglineProgress.get(),
    transform: [{ translateY: (1 - taglineProgress.get()) * 8 }],
  }));

  return (
    <Animated.View pointerEvents="none" style={[styles.overlay, overlayStyle]}>
      <View style={styles.bubbleLayer}>
        <View style={styles.bubbleOrigin}>
          {BUBBLES.map((bubble, index) => (
            <Bubble key={bubble.text} bubble={bubble} index={index} reduced={reduced} />
          ))}
        </View>
      </View>

      <View style={styles.logoRow}>
        {LETTERS.map((char, index) => (
          <Letter key={index} char={char} index={index} reduced={reduced} />
        ))}
      </View>

      <Animated.Text style={[styles.tagline, taglineStyle]}>Bruxelles 📍</Animated.Text>
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
  bubbleLayer: {
    ...StyleSheet.absoluteFill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  // Point de repère au centre de l'écran : les x/y des bulles s'y mesurent.
  bubbleOrigin: {
    width: 0,
    height: 0,
  },
  bubbleWrap: {
    position: 'absolute',
  },
  bubbleShadow: {
    ...StyleSheet.absoluteFill,
    top: 4,
    left: 4,
    right: -4,
    bottom: -4,
    backgroundColor: colors.ink,
    borderRadius: 8,
  },
  bubble: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderWidth: borders.base,
    borderColor: colors.ink,
    borderRadius: 8,
  },
  bubbleText: {
    fontFamily: fontFamily.bodyBold,
    fontSize: 16,
  },
  logoRow: {
    flexDirection: 'row',
  },
  logoText: {
    fontFamily: fontFamily.display,
    fontSize: 46,
    letterSpacing: 0.5,
  },
  logoShadow: {
    position: 'absolute',
    top: 5,
    left: 5,
    color: colors.ink,
  },
  logoFront: {
    color: colors.white,
  },
  tagline: {
    marginTop: 22,
    fontFamily: fontFamily.bodyBold,
    fontSize: 16,
    color: colors.white,
    letterSpacing: 1,
  },
});
