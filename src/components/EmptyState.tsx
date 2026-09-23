import React from 'react';
import { View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, radii } from '@/design/tokens';
import { HardShadow } from '@/design/HardShadow';
import { Text } from './Text';

type Props = {
  icon?: keyof typeof Ionicons.glyphMap;
  title: string;
  subtitle?: string;
  tone?: string;
};

/**
 * Convertit une icône "outline" (trait fin) en sa variante pleine : le trait
 * fin des icônes outline jure avec les bordures épaisses du style
 * néo-brutaliste, la variante pleine "pèse" le même poids visuel que le
 * contour de 3px qui l'entoure.
 */
function toBoldIcon(icon: keyof typeof Ionicons.glyphMap): keyof typeof Ionicons.glyphMap {
  const bold = icon.replace(/-outline$/, '') as keyof typeof Ionicons.glyphMap;
  return bold in Ionicons.glyphMap ? bold : icon;
}

export function EmptyState({ icon = 'happy-outline', title, subtitle, tone = colors.pink }: Props) {
  return (
    <View style={{ alignItems: 'center', padding: spacing.xl }}>
      <HardShadow
        backgroundColor={tone}
        radius={radii.sm}
        offset={6}
        style={{ marginBottom: spacing.md, transform: [{ rotate: '-4deg' }] }}
      >
        <View
          style={{
            width: 84,
            height: 84,
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Ionicons name={toBoldIcon(icon)} size={40} color={colors.ink} />
        </View>
      </HardShadow>
      <Text variant="subtitle" style={{ textAlign: 'center', marginBottom: spacing.xxs }}>
        {title}
      </Text>
      {subtitle && (
        <Text variant="body" style={{ textAlign: 'center', color: colors.grey600, maxWidth: 280 }}>
          {subtitle}
        </Text>
      )}
    </View>
  );
}
