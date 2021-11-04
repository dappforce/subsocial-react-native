//////////////////////////////////////////////////////////////////////
// Wrapper around RNPaper. Use components as drop-in replacement for
// RNP-equivalents.
// Components here adhere to our custom extended theming.
import React, { useMemo } from 'react'
import RN, { Falsy, GestureResponderEvent, StyleProp, StyleSheet, TextStyle, ViewStyle } from 'react-native'
import * as Linking from 'expo-linking'
import * as Paper from 'react-native-paper'
import * as Elements from 'react-native-elements'
import Md, { MarkdownProps as MdProps } from 'react-native-markdown-display'
import { reduceMarkdownTheme, Theme, useTheme } from './Theming'

export type TextProps = RN.TextProps & React.PropsWithChildren<{
  /** Defaults to 'primary' */
  mode?: keyof Theme['fonts']
  disabled?: boolean
}>
export function Text({
  children,
  mode = 'primary',
  disabled = false,
  style,
  ...props
}: TextProps)
{
  const theme = useTheme();
  const _style = useMemo(() => {
    const combinedStyle: TextStyle = {
      ...theme.fonts[mode],
      color: modeColor(mode, disabled, theme),
    }
    
    return StyleSheet.flatten<TextStyle>([ combinedStyle, style ])
  }, [ style, mode, theme ])
  
  return <RN.Text {...props} style={_style}>{children}</RN.Text>
}

function modeColor(mode: keyof Theme['fonts'], disabled: boolean, theme: Theme) {
  if (disabled) return theme.colors.textDisabled
  
  switch (mode) {
    case 'secondary':
      return theme.colors.textSecondary
    
    default:
      return theme.colors.textPrimary
  }
}

export type TitleProps = Omit<TextProps, 'mode' | 'composeStyles'> & React.PropsWithChildren<{
  preview?: boolean
}>
export function Title({ preview = false, ...props }: TitleProps) {
  return Text({ ...props, mode: preview ? 'titlePreview' : 'titleDetails' })
}

export type ButtonProps = Omit<React.ComponentProps<typeof Paper.Button>, "theme">
export function Button({ children, style, labelStyle, ...props }: ButtonProps) {
  let { mode, color } = props
  const theme = useTheme()
  color = color ?? theme.colors.primary
  
  const _style = useMemo(() => {
    return StyleSheet.compose<ViewStyle>(
      {
        borderColor: mode === 'outlined' ? color : 'transparent',
      },
      style
    )
  }, [ mode, color, style ])
  
  const _labelStyle = useMemo(() => {
    return StyleSheet.compose<TextStyle>(
      {
        ...theme.fonts.button,
        textTransform: 'none',
      },
      StyleSheet.flatten(labelStyle)
    )
  }, [ theme, labelStyle ])
  
  return <Paper.Button {...props} style={_style} labelStyle={_labelStyle}>{children}</Paper.Button>
}

export type SpanProps = TextProps & React.PropsWithChildren<{}>
export function Span({ children, style, ...props }: SpanProps) {
  const theme = Paper.useTheme()
  
  return (
    <Text
      {...props}
      style={[ {fontStyle: 'italic', color: theme.colors.accent}, style ]}
    >
      {children}
    </Text>
  )
}

export type LinkResponderEvent = GestureResponderEvent & {
  url: string | undefined
}
export type LinkProps = Omit<RN.TextProps, 'onPress'> & {
  url?: string
  onPress?: (evt: LinkResponderEvent) => void
  children?: string | Falsy
}
export function Link({ children: label, url, onPress, style, ...props }: LinkProps) {
  if (!label && !url) throw new Error('require one of label or url')
  
  if (!label) label = url
  
  const theme = useTheme()
  const defaultHandler = () => { url && Linking.openURL(url) }
  
  return (
    <Paper.Text
      {...props}
      style={[ {color: theme.colors.link}, style ]}
      onPress={evt => (onPress??defaultHandler)({ ...evt, url })}
    >
      {label}
    </Paper.Text>
  )
}

export type MarkdownProps = MdProps & {
  children: string
}
export function Markdown({ children, style, ...props }: MarkdownProps) {
  const theme = useTheme()
  
  const rootstyles = useMemo(() => (
    reduceMarkdownTheme(style ?? {}, theme)
  ), [ style, theme ])
  
  return <Md {...props} style={rootstyles} mergeStyle={false}>{children}</Md>
}

type PaperChipProps = React.ComponentProps<typeof Paper.Chip>
export type ChipProps = Omit<PaperChipProps, 'mode' | 'style' | 'textStyle'> & {
  mode?: 'flat' | 'accent' | 'outlined'
  style?: StyleProp<ViewStyle>
  textStyle?: StyleProp<TextStyle>
}
export function Chip({mode: _mode, children, style, textStyle, ...props}: ChipProps) {
  const theme = useTheme()
  const mode = _mode ?? 'flat'
  
  const bgc = {
    flat: theme.colors.backgroundMenu,
    accent: theme.colors.backgroundMenuHover,
    outlined: 'transparent',
  }
  
  const _style = useMemo(() => StyleSheet.compose<ViewStyle>({
    backgroundColor: bgc[mode],
  }, style), [ mode, theme, style ])
  
  const _textStyle = useMemo(() => (
    StyleSheet.compose<TextStyle>(
      {
        color: theme.colors.textSecondary,
      },
      textStyle
    )
  ), [ theme, textStyle ])
  
  return (
    <Paper.Chip
      mode={Chip.paperMode[mode]}
      {...props}
      style={_style}
      textStyle={_textStyle}
    >
      {children}
    </Paper.Chip>
  )
}
Chip.paperMode = {
  'flat': 'flat',
  'accent': 'flat',
  'outlined': 'outlined',
} as Record<string, NonNullable<PaperChipProps['mode']>>

export type DividerProps = Elements.DividerProps
export function Divider(props: DividerProps) {
  const { colors } = useTheme()
  return <Elements.Divider color={colors.divider} {...props} />
}
