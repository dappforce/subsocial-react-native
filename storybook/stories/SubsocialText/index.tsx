//////////////////////////////////////////////////////////////////////
// Simple text with color scheme based font color
// SPDX-License-Identifier: GPL-3.0
import React, { PropsWithChildren, useMemo } from 'react'
import { StyleSheet, Text, TextProps, TextStyle, useColorScheme } from 'react-native'

export default function SubsocialText({children, style, ...props}: PropsWithChildren<TextProps>) {
  const scheme = useColorScheme();
  const schemeStyle = useMemo<TextStyle>(() => ({color: scheme === 'light' ? 'black' : 'white'}), [scheme]);
  const _style = useMemo(() => StyleSheet.compose(schemeStyle, style), [style, scheme]);
  return <Text style={_style} {...props}>{children}</Text>
}
