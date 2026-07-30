import React from 'react';
import { Pressable, View, StyleProp, ViewStyle } from 'react-native';
import { colors, spacing, borders, radii, fontFamily, fontSize } from '@/design/tokens';
import { Text } from './Text';

type Props = {
  label: string;
  selected?: boolean;
  onPress?: () => void;
  color?: string;
  style?: StyleProp<ViewStyle>;
  small?: boolean;
};

/**
 * Pastille (chip) utilisée pour les langues, filtres, etc. Sélectionnée =
 * fond coloré plein ; non sélectionnée = contour seul (flat, pas d'ombre —
 * les chips vivent en groupe serré, l'ombre créerait un bruit visuel).
 */
export function Chip({ label, selected, onPress, color = colors.blue, style, small }: Props) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole={onPress ? 'button' : 'text'}
      accessibilityState={{ selected: !!selected }}
      style={[
        {
          borderWidth: borders.base,
          borderColor: colors.ink,
          borderRadius: radii.pill,
          paddingVertical: small ? 4 : spacing.xxs,
          paddingHorizontal: small ? spacing.xs : spacing.sm,
          backgroundColor: selected ? color : colors.white,
        },
        style,
      ]}
    >
      <Text
        style={{
          fontFamily: fontFamily.bodyBold,
          fontSize: small ? fontSize.xs : fontSize.sm,
          color: colors.ink,
        }}
      >
        {label}
      </Text>
    </Pressable>
  );
}
