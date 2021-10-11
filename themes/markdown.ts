//////////////////////////////////////////////////////////////////////
// Not a theme, but a helper to produce theme-compatible markdown
// styling.
import { StyleSheet } from 'react-native'
import { DefaultTheme } from 'react-native-paper'

export default function createMDStyles(theme: typeof DefaultTheme) {
  return StyleSheet.create({
    body: {
      ...theme.fonts.regular,
      color: theme.colors.text,
    },
    heading1: {
      ...theme.fonts.medium,
      fontSize: 18,
      fontWeight: 'bold',
      marginTop: 6,
      marginBottom: 4,
    },
    heading2: {
      ...theme.fonts.medium,
      fontSize: 16,
      fontWeight: 'bold',
      marginTop: 6,
      marginBottom: 4,
    },
    heading3: {
      ...theme.fonts.medium,
      fontSize: 14,
      fontWeight: 'bold',
      marginTop: 6,
      marginBottom: 4,
    },
    heading4: {
      ...theme.fonts.medium,
      fontSize: 12,
      fontWeight: 'bold',
      marginTop: 6,
      marginBottom: 4,
    },
    heading5: {
      ...theme.fonts.medium,
      fontSize: 10,
      fontWeight: 'bold',
      marginTop: 6,
      marginBottom: 4,
    },
    heading6: {
      ...theme.fonts.medium,
      fontSize: 10,
      fontStyle: 'italic',
      marginTop: 6,
      marginBottom: 4,
    },
    hr: {
      backgroundColor: theme.colors.accent,
      marginTop: 6,
      marginBottom: 6,
    },
    list_item: {
      marginTop: 2,
      marginBottom: 2,
    },
    link: {
      color: theme.colors.accent,
      textDecorationLine: 'none',
    },
    code_block: {
      backgroundColor: theme.colors.surface,
      borderLeftColor: theme.colors.onSurface,
      borderLeftWidth: 3,
    },
    code_inline: {
      backgroundColor: theme.colors.surface,
    },
    blockquote: {
      backgroundColor: theme.colors.surface,
      borderLeftColor: theme.colors.onSurface,
      borderLeftWidth: 3,
    },
  });
}
