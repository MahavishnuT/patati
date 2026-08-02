import React from 'react';
import { TextInput, View, TextInputProps, ViewStyle, StyleProp } from 'react-native';
import { colors, spacing, borders, radii, fontFamily, fontSize } from '@/design/tokens';
import { Text } from './Text';

type Props = TextInputProps & {
  label?: string;
  error?: string;
  containerStyle?: StyleProp<ViewStyle>;
};

export function TextField({ label, error, style, containerStyle, ...rest }: Props) {
  return (
    <View style={[{ marginBottom: spacing.sm }, containerStyle]}>
      {label && (
        <Text variant="caption" style={{ marginBottom: spacing.xxs, fontFamily: fontFamily.bodyBold, color: colors.ink }}>
          {label}
        </Text>
      )}
      <TextInput
        placeholderTextColor={colors.grey400}
        style={[
          {
            borderWidth: borders.base,
            borderColor: error ? colors.danger : colors.ink,
            borderRadius: radii.sm,
            paddingVertical: spacing.xs,
            paddingHorizontal: spacing.sm,
            fontFamily: fontFamily.body,
            fontSize: fontSize.md,
            backgroundColor: colors.white,
            color: colors.ink,
          },
          style,
        ]}
        {...rest}
      />
      {error && (
        <Text variant="caption" style={{ color: colors.danger, marginTop: spacing.xxs }}>
          {error}
        </Text>
      )}
    </View>
  );
}
