//////////////////////////////////////////////////////////////////////
// Default Light Mode Theme
import { DarkTheme } from "react-native-paper"
import LightTheme from './light'

const theme: typeof DarkTheme = {
  ...DarkTheme,
  dark: true,
  mode: 'adaptive',
  roundness: LightTheme.roundness,
  colors: {
    ...DarkTheme.colors,
    primary: LightTheme.colors.primary,
    accent: LightTheme.colors.accent,
    background: '#15202B',
    text: 'white',
  },
};

export default theme;
