//////////////////////////////////////////////////////////////////////
// Additional common typographic components to be used together with
// RNP Typography components.
import React from 'react'
import { TextProps, Falsy, GestureResponderEvent } from 'react-native'
import * as Linking from 'expo-linking'
import { DefaultTheme, Text, useTheme } from 'react-native-paper'

type Theme = typeof DefaultTheme

export type SpanProps = TextProps & React.PropsWithChildren<{
  theme?: Theme
}>
export function Span({children, style, ...props}: SpanProps) {
  const theme = useTheme();
  return <Text {...props} style={[{fontStyle: 'italic', color: theme.colors.accent}, style]}>{children}</Text>
}

export type LinkResponderEvent = GestureResponderEvent & {
  url: string | undefined
}
export type LinkProps = Omit<TextProps, 'onPress'> & {
  url?: string
  theme?: Theme
  onPress?: (evt: LinkResponderEvent) => void
  children?: string | Falsy
}
export function Link({children: label, url, onPress, style, ...props}: LinkProps) {
  if (!label && !url) throw new Error('require one of label or url')
  if (!label) label = url;
  const theme = useTheme();
  
  const defaultHandler = () => {url && Linking.openURL(url)}
  
  return (
    <Text
      {...props}
      style={[{color: theme.colors.accent, textDecorationLine: 'underline'}, style]}
      onPress={evt => (onPress??defaultHandler)({...evt, url})}
    >
      {label}
    </Text>
  )
}
