import React from 'react';
import { View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, spacing, borders } from '@/design/tokens';
import { Text } from './Text';

type Props = {
  title: string;
  right?: React.ReactNode;
  tone?: string;
};

/** Barre de titre en haut d'écran : bloc plein + bordure basse épaisse (pas d'ombre portée, elle "ferme" le haut de l'écran). */
export function TopBar({ title, right, tone = colors.yellow }: Props) {
  return (
    <SafeAreaView edges={['top']} style={{ backgroundColor: tone, borderBottomWidth: borders.thick, borderBottomColor: colors.ink }}>
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          paddingHorizontal: spacing.md,
          paddingVertical: spacing.sm,
        }}
      >
        <Text variant="title" numberOfLines={1} style={{ flexShrink: 1 }}>
          {title}
        </Text>
        {right}
      </View>
    </SafeAreaView>
  );
}
