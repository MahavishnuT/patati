import React from 'react';
import { View } from 'react-native';
import { Image } from 'expo-image';
import { colors, borders, radii } from '@/design/tokens';
import { Text } from './Text';

type Props = {
  uri?: string | null;
  name?: string;
  size?: number;
  color?: string;
};

/** Avatar carré (formes plates), bordure épaisse, initiale de repli si pas de photo. */
export function Avatar({ uri, name, size = 56, color = colors.yellow }: Props) {
  const initial = (name ?? '?').trim().charAt(0).toUpperCase();
  return (
    <View
      style={{
        width: size,
        height: size,
        borderWidth: borders.base,
        borderColor: colors.ink,
        borderRadius: radii.sm,
        backgroundColor: color,
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
      }}
    >
      {uri ? (
        <Image source={{ uri }} style={{ width: '100%', height: '100%' }} contentFit="cover" />
      ) : (
        <Text variant="title" style={{ fontSize: size * 0.4, lineHeight: size * 0.45 }}>
          {initial}
        </Text>
      )}
    </View>
  );
}
