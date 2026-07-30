import React from 'react';
import { View } from 'react-native';
import { colors, spacing } from '@/design/tokens';

type Props = {
  children: React.ReactNode;
  scroll?: boolean;
  padded?: boolean;
};

export function ScreenContainer({ children, padded = true }: Props) {
  return (
    <View style={{ flex: 1, backgroundColor: colors.bg, padding: padded ? spacing.md : 0 }}>
      {children}
    </View>
  );
}
