//////////////////////////////////////////////////////////////////////
// Wrapper around RNPaper. Use components as drop-in replacement for
// RNP-equivalents.
// Components here adhere to our custom extended theming.
import React, { useMemo } from 'react'
import { Falsy, GestureResponderEvent, StyleProp, StyleSheet, TextProps, TextStyle, ViewStyle } from 'react-native'
import * as Linking from 'expo-linking'
import * as Paper from 'react-native-paper'
import Md, { MarkdownProps as MdProps } from 'react-native-markdown-display'
import { reduceMarkdownTheme, Theme, useTheme } from './Theming'

export type ButtonProps = React.ComponentProps<typeof Paper.Button>
export function Button({children, style, ...props}: ButtonProps) {
  let {mode, color} = props;
  const theme = useTheme();
  color = color ?? theme.colors.primary;
  
  const _style = useMemo(() => StyleSheet.compose<ViewStyle>({
    borderColor: mode === 'outlined' ? color : 'transparent',
  }, style), [mode, color, style]);
  
  return <Paper.Button {...props} style={_style}>{children}</Paper.Button>
}

export type SpanProps = TextProps & React.PropsWithChildren<{
  theme?: Theme
}>
export function Span({children, style, ...props}: SpanProps) {
  const theme = Paper.useTheme();
  return <Paper.Text {...props} style={[{fontStyle: 'italic', color: theme.colors.accent}, style]}>{children}</Paper.Text>
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
    <Paper.Text
      {...props}
      style={[{color: theme.colors.link}, style]}
      onPress={evt => (onPress??defaultHandler)({...evt, url})}
    >
      {label}
    </Paper.Text>
  )
}

export type MarkdownProps = MdProps & {
  children: string
}
export function Markdown({children, style, ...props}: MarkdownProps) {
  const theme = useTheme();
  const paper = Paper.useTheme();
  const rootstyles = useMemo(() => reduceMarkdownTheme(style??{}, theme, paper), [style, theme, paper]);
  return <Md {...props} style={rootstyles}>{children}</Md>
}

type PaperChipProps = React.ComponentProps<typeof Paper.Chip>
export type ChipProps = Omit<PaperChipProps, 'mode' | 'style' | 'textStyle'> & {
  mode?: 'flat' | 'accent' | 'outlined'
  style?: StyleProp<ViewStyle>
  textStyle?: StyleProp<TextStyle>
}
export function Chip({mode, children, style, textStyle, ...props}: ChipProps) {
  const theme = useTheme();
  mode = mode ?? 'flat';
  
  const bgc = {
    flat: theme.colors.backgroundMenu,
    accent: theme.colors.backgroundMenuHover,
    outlined: 'transparent',
  };
  
  const _style = useMemo(() => StyleSheet.compose<ViewStyle>({
    backgroundColor: bgc[mode!],
  }, style), [mode, theme, style])
  const _textStyle = useMemo(() => StyleSheet.compose<TextStyle>({
    color: theme.colors.textSecondary,
  }, textStyle), [theme, textStyle]);
  return <Paper.Chip mode={Chip.paperMode[mode!]} {...props} style={_style} textStyle={_textStyle}>{children}</Paper.Chip>
}
Chip.paperMode = {
  'flat': 'flat',
  'accent': 'flat',
  'outlined': 'outlined',
} as Record<string, NonNullable<PaperChipProps['mode']>>

export type DividerProps = {
  style?: StyleProp<ViewStyle>
}
export function Divider({style, ...props}: DividerProps) {
  const {colors} = useTheme();
  return <Paper.Divider {...props} style={[{backgroundColor: colors.divider}, style]} />
}
