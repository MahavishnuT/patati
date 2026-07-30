import React from 'react';
import { Text as RNText, TextProps, TextStyle } from 'react-native';
import { colors, fontFamily, fontSize } from '@/design/tokens';

type Variant = 'display' | 'title' | 'subtitle' | 'body' | 'bodyBold' | 'caption';

const variantStyle: Record<Variant, TextStyle> = {
  display: { fontFamily: fontFamily.display, fontSize: fontSize.xxl, color: colors.ink, lineHeight: 40 },
  title: { fontFamily: fontFamily.display, fontSize: fontSize.xl, color: colors.ink, lineHeight: 32 },
  subtitle: { fontFamily: fontFamily.bodyBold, fontSize: fontSize.lg, color: colors.ink },
  body: { fontFamily: fontFamily.body, fontSize: fontSize.md, color: colors.ink },
  bodyBold: { fontFamily: fontFamily.bodyBold, fontSize: fontSize.md, color: colors.ink },
  caption: { fontFamily: fontFamily.body, fontSize: fontSize.sm, color: colors.grey600 },
};

export function Text({ variant = 'body', style, ...rest }: TextProps & { variant?: Variant }) {
  return <RNText allowFontScaling style={[variantStyle[variant], style]} {...rest} />;
}
