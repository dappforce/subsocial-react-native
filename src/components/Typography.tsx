//////////////////////////////////////////////////////////////////////
// Wrapper around RNPaper. Use components as drop-in replacement for
// RNP-equivalents.
// Components here adhere to our custom extended theming.
import React, { useMemo } from 'react'
import RN, { Falsy, GestureResponderEvent, StyleProp, StyleSheet, TextStyle, View, ViewStyle } from 'react-native'
import * as Linking from 'expo-linking'
import * as Paper from 'react-native-paper'
import { createThemedStylesHook, Theme, useTheme } from './Theming'

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
    
    return StyleSheet.compose<TextStyle>(
      combinedStyle,
      style
    )
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
      labelStyle
    )
  }, [ theme, labelStyle ])
  
  return <Paper.Button {...props} style={_style} labelStyle={_labelStyle}>{children}</Paper.Button>
}

export type SpanProps = TextProps & React.PropsWithChildren<{}>
export function Span({ children, style, ...props }: SpanProps) {
  const themedStyles = useThemedStyles()
  
  return (
    <Text
      {...props}
      style={[ themedStyles.span, style ]}
    >
      {children}
    </Text>
  )
}

export type LinkResponderEvent = GestureResponderEvent & {
  url: string | undefined
}
export type LinkProps = Omit<TextProps, 'onPress' | 'mode'> & {
  mode: 'primary' | 'secondary'
  url?: string
  onPress?: (evt: LinkResponderEvent) => void
  children?: string | Falsy
}
export function Link({ children: label, url, onPress, style, ...props }: LinkProps) {
  if (!label && !url) throw new Error('require one of label or url')
  
  if (!label) label = url
  
  const themedStyles = useThemedStyles()
  const defaultHandler = () => { url && Linking.openURL(url) }
  
  return (
    <Text
      {...props}
      style={[ themedStyles.link, style ]}
      onPress={evt => (onPress ?? defaultHandler)({ ...evt, url })}
    >
      {label}
    </Text>
  )
}

type PaperChipProps = React.ComponentProps<typeof Paper.Chip>
export type ChipProps = Omit<PaperChipProps, 'mode' | 'style' | 'textStyle'> & {
  mode?: 'flat' | 'accent' | 'outlined'
  style?: StyleProp<ViewStyle>
  labelStyle?: StyleProp<TextStyle>
}
export function Chip({ mode = 'flat', children, style: _style, labelStyle: labelStyle, ...props }: ChipProps) {
  const styles = useThemedStyles()
  
  let style
  switch (mode) {
    case 'flat': style = styles.chipFlat; break
    case 'accent': style = styles.chipAccent; break
    case 'outlined': style = styles.chipOutlined; break
  }
  
  return (
    <Paper.Chip
      mode={Chip.paperMode[mode]}
      {...props}
      style={[style, _style]}
      textStyle={[styles.chipLabel, labelStyle]}
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

export type DividerProps = {
  color?: string
  style?: StyleProp<ViewStyle>
}
export function Divider({ color, style }: DividerProps) {
  const styles = useThemedStyles()
  return <View style={[styles.divider, !!color && { backgroundColor: color }, style]} />
}


const useThemedStyles = createThemedStylesHook(({ colors }) => StyleSheet.create({
  span: {
    fontFamily: 'RobotoItalic',
    color: colors.primary,
  },
  link: {
    color: colors.link,
  },
  chipFlat: {
    backgroundColor: colors.backgroundMenu,
  },
  chipAccent: {
    backgroundColor: colors.backgroundMenuHover,
  },
  chipOutlined: {
    borderColor: 'transparent',
  },
  chipLabel: {
    color: colors.textSecondary,
  },
  divider: {
    width: '100%',
    height: StyleSheet.hairlineWidth,
    backgroundColor: colors.divider,
  },
}))
