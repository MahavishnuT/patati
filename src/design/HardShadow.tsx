import React from 'react';
import { View, ViewStyle, StyleProp } from 'react-native';
import { colors, borders, radii } from './tokens';

type Props = {
  children: React.ReactNode;
  offset?: number;
  radius?: number;
  shadowColor?: string;
  style?: StyleProp<ViewStyle>;
  backgroundColor?: string;
  borderColor?: string;
  borderWidth?: number;
};

/**
 * Enveloppe tout contenu avec l'ombre "dure" caractéristique du néo-brutalisme :
 * un rectangle plein noir décalé en dessous, sans flou, au lieu d'un box-shadow
 * classique (qui rend différemment/mal sur iOS/Android). Le contenu est posé au
 * dessus avec sa propre bordure épaisse.
 */
export function HardShadow({
  children,
  offset = 6,
  radius = radii.none,
  shadowColor = colors.ink,
  style,
  backgroundColor = colors.white,
  borderColor = colors.ink,
  borderWidth = borders.base,
}: Props) {
  return (
    <View style={[{ position: 'relative' }, style]}>
      <View
        style={{
          position: 'absolute',
          top: offset,
          left: offset,
          right: -0,
          bottom: -0,
          backgroundColor: shadowColor,
          borderRadius: radius,
        }}
      />
      <View
        style={{
          backgroundColor,
          borderRadius: radius,
          borderWidth,
          borderColor,
        }}
      >
        {children}
      </View>
    </View>
  );
}
