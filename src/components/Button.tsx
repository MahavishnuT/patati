import React from 'react';
import { Pressable, StyleProp, ViewStyle, ActivityIndicator, PressableProps } from 'react-native';
import { HardShadow } from '@/design/HardShadow';
import { colors, spacing, borders } from '@/design/tokens';
import { Text } from './Text';

type Tone = 'ink' | 'yellow' | 'pink' | 'blue' | 'green' | 'white';

const toneBg: Record<Tone, string> = {
  ink: colors.ink,
  yellow: colors.yellow,
  pink: colors.pink,
  blue: colors.blue,
  green: colors.green,
  white: colors.white,
};

const toneText: Record<Tone, string> = {
  ink: colors.white,
  yellow: colors.ink,
  pink: colors.white,
  blue: colors.white,
  green: colors.ink,
  white: colors.ink,
};

type Props = Omit<PressableProps, 'style'> & {
  label: string;
  tone?: Tone;
  fullWidth?: boolean;
  loading?: boolean;
  size?: 'sm' | 'md';
  style?: StyleProp<ViewStyle>;
};

/**
 * Bouton néo-brutaliste : bloc plat + ombre dure décalée. L'ombre "s'aplatit"
 * (se colle au bouton) quand on appuie, pour donner un vrai effet tactile.
 */
export function Button({ label, tone = 'ink', fullWidth, loading, size = 'md', style, disabled, ...rest }: Props) {
  const [pressed, setPressed] = React.useState(false);
  const padV = size === 'sm' ? spacing.xs : spacing.sm + 2;

  return (
    <Pressable
      onPressIn={() => setPressed(true)}
      onPressOut={() => setPressed(false)}
      disabled={disabled || loading}
      style={[fullWidth ? { width: '100%' } : undefined, style]}
      accessibilityRole="button"
      accessibilityLabel={label}
      {...rest}
    >
      <HardShadow
        offset={pressed ? 0 : 5}
        backgroundColor={toneBg[tone]}
        borderColor={colors.ink}
        borderWidth={borders.base}
        style={[
          { transform: [{ translateX: pressed ? 4 : 0 }, { translateY: pressed ? 4 : 0 }] },
          disabled ? { opacity: 0.5 } : undefined,
        ]}
      >
        <Text
          variant="subtitle"
          style={{
            color: toneText[tone],
            textAlign: 'center',
            paddingVertical: padV,
            paddingHorizontal: spacing.md,
          }}
        >
          {loading ? '' : label}
        </Text>
        {loading && (
          <ActivityIndicator
            color={toneText[tone]}
            style={{ position: 'absolute', alignSelf: 'center', top: padV - 2 }}
          />
        )}
      </HardShadow>
    </Pressable>
  );
}
