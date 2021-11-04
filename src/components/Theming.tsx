//////////////////////////////////////////////////////////////////////
// Custom theming solution reducing to themes of used 3P libraries
// (e.g. RN-Elements, RN-Paper).
import React, { useContext, useMemo } from 'react'
import { StyleSheet, TextStyle, useColorScheme } from 'react-native'
import { MarkdownProps as MdProps } from 'react-native-markdown-display'
import { DefaultTheme as DefaultPaperTheme, Provider as PaperProvider } from 'react-native-paper'
import { DefaultTheme as DefaultNavigationTheme } from '@react-navigation/native'

type PaperFontProps = 'fontFamily'
type FontList<Keys extends string> = { [Key in Keys]: Required<Pick<TextStyle, PaperFontProps>> & Omit<TextStyle, PaperFontProps> }

export type PaperTheme = typeof DefaultPaperTheme
export type NavigationTheme = typeof DefaultNavigationTheme
export type Theme = {
  colors: {
    primary: string
    secondary: string
    textPrimary: string
    textSecondary: string
    textDisabled: string
    link: string
    background: string
    backgroundMenu: string
    backgroundMenuHover: string
    backdrop: string
    scaffold: string
    appBar: string
    line: string
    divider: string
    icon: string
    socials: string
    confirmation: string
  }
  consts: {
    roundness: number
  }
  fonts: FontList<
    'primary' |
    'secondary' |
    'titleDetails' |
    'titlePreview' |
    'button' | 
    'profileName'
  >
}
export type DualismTheme = {
  light: Theme
  dark: Theme
}

export const isDualismTheme = (obj: any): obj is DualismTheme => obj && obj.light && obj.dark

export const ThemeContext = React.createContext(undefined as unknown as Theme)
export const useTheme = () => useContext(ThemeContext)

/**
 * Properties for ThemeProvider component.
 * 
 * @prop {boolean} dark should be set when `theme` is a `Theme` - not a `DualismTheme`. It defaults to `'light'`.
 */
export type ThemeProviderProps = React.PropsWithChildren<{
  theme: Theme | DualismTheme
  dark?: boolean
}>
export function ThemeProvider({ children, theme, dark }: ThemeProviderProps) {
  const scheme = useColorScheme() || 'light'
  
  let _theme = isDualismTheme(theme) ? theme[scheme] : theme
  
  const paperTheme = useMemo(() => reducePaperTheme(_theme, !!dark), [ _theme ])
  return (
    <ThemeContext.Provider value={_theme}>
      <PaperProvider theme={paperTheme}>
        {children}
      </PaperProvider>
    </ThemeContext.Provider>
  )
}

export const reduceNavigationTheme = ({ colors }: Theme, dark: boolean): NavigationTheme => ({
  dark,
  colors: {
    ...DefaultNavigationTheme.colors,
    primary:    colors.primary,
    background: colors.background,
    text:       colors.textPrimary,
    border:     colors.line,
  }
})

export const reducePaperTheme = ({colors, consts, fonts}: Theme, dark: boolean): PaperTheme => ({
  dark,
  mode: 'adaptive',
  roundness: consts.roundness,
  colors: {
    primary: colors.primary,
    accent: colors.secondary,
    background: colors.background,
    surface: colors.scaffold,
    onSurface: colors.line,
    text: colors.textPrimary,
    disabled: colors.textDisabled,
    placeholder: colors.textDisabled,
    backdrop: colors.backdrop,
    notification: colors.primary,
    error: DefaultPaperTheme.colors.error,
  },
  fonts: DefaultPaperTheme.fonts,
  animation: DefaultPaperTheme.animation,
})

const mdHeadingMargins = { marginTop: 6, marginBottom: 4 }
export const reduceMarkdownTheme = (base: NonNullable<MdProps['style']>, { colors, fonts }: Theme) => StyleSheet.create({
  ...base,
  body: {
    ...fonts.primary,
    color: colors.textPrimary,
    ...base.body,
  },
  heading1: {
    ...fonts.titleDetails,
    ...mdHeadingMargins,
    fontSize: 18,
    ...base.heading1,
  },
  heading2: {
    ...fonts.titleDetails,
    ...mdHeadingMargins,
    fontSize: 16,
    ...base.heading2,
  },
  heading3: {
    ...fonts.titleDetails,
    ...mdHeadingMargins,
    fontSize: 14,
    ...base.heading3,
  },
  heading4: {
    ...fonts.titleDetails,
    ...mdHeadingMargins,
    fontSize: 12,
    ...base.heading4,
  },
  heading5: {
    ...fonts.titleDetails,
    ...mdHeadingMargins,
    fontSize: 10,
    ...base.heading5,
  },
  heading6: {
    ...fonts.titleDetails,
    ...mdHeadingMargins,
    fontSize: 10,
    fontStyle: 'italic',
    fontWeight: undefined,
    ...base.heading6,
  },
  hr: {
    backgroundColor: colors.line,
    marginVertical: 6,
    ...base.hr,
  },
  list_item: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    marginTop: 2,
    marginBottom: 2,
    ...base.list_item,
  },
  link: {
    color: colors.link,
    textDecorationLine: 'none',
    ...base.link,
  },
  code_block: {
    backgroundColor: colors.scaffold,
    borderLeftColor: colors.line,
    borderLeftWidth: 3,
    ...base.code_block,
  },
  code_inline: {
    backgroundColor: colors.scaffold,
    ...base.code_inline,
  },
  blockquote: {
    backgroundColor: colors.scaffold,
    borderLeftColor: colors.line,
    borderLeftWidth: 3,
    ...base.blockquote,
  },
})


export type StyleFactory<T> = {
  (theme: Theme): T | StyleSheet.NamedStyles<T>
}
export type StyleFactoryHook<T> = {
  (): T | StyleSheet.NamedStyles<T>
}

/** A hook which reuses the same StyleSheet across instances of the same component.
 * 
 * The StyleSheet is automatically recomputed when the theme changes.
 * 
 * @param factory to create the StyleSheet upon theme change.
 * @returns the hook.
 */
export function createThemedStylesHook<T>(factory: StyleFactory<T>): StyleFactoryHook<T> {
  let oldTheme = undefined as unknown as Theme
  let cached   = undefined as unknown as StyleSheet.NamedStyles<T>
  
  const useThemedStyle = () => {
    const theme = useTheme()
    
    if (theme !== oldTheme) {
      cached = factory(theme)
    }
    
    return cached
  }
  return useThemedStyle
}
