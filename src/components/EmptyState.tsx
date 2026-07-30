import React from 'react';
import { View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, borders, radii } from '@/design/tokens';
import { Text } from './Text';

type Props = {
  icon?: keyof typeof Ionicons.glyphMap;
  title: string;
  subtitle?: string;
};

export function EmptyState({ icon = 'happy-outline', title, subtitle }: Props) {
  return (
    <View style={{ alignItems: 'center', padding: spacing.xl }}>
      <View
        style={{
          width: 72,
          height: 72,
          borderRadius: radii.sm,
          borderWidth: borders.base,
          borderColor: colors.ink,
          backgroundColor: colors.pink,
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: spacing.md,
        }}
      >
        <Ionicons name={icon} size={34} color={colors.ink} />
      </View>
      <Text variant="subtitle" style={{ textAlign: 'center', marginBottom: spacing.xxs }}>
        {title}
      </Text>
      {subtitle && (
        <Text variant="body" style={{ textAlign: 'center', color: colors.grey600 }}>
          {subtitle}
        </Text>
      )}
    </View>
  );
}
