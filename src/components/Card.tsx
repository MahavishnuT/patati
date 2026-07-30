import React from 'react';
import { View, StyleProp, ViewStyle } from 'react-native';
import { HardShadow } from '@/design/HardShadow';
import { colors, spacing, borders, radii } from '@/design/tokens';

type Props = {
  children: React.ReactNode;
  backgroundColor?: string;
  style?: StyleProp<ViewStyle>;
  padded?: boolean;
  offset?: number;
};

export function Card({ children, backgroundColor = colors.white, style, padded = true, offset = 6 }: Props) {
  return (
    <HardShadow backgroundColor={backgroundColor} borderColor={colors.ink} borderWidth={borders.base} radius={radii.sm} offset={offset} style={style}>
      <View style={padded ? { padding: spacing.md } : undefined}>{children}</View>
    </HardShadow>
  );
}
