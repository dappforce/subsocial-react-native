//////////////////////////////////////////////////////////////////////
// Default Light Mode Theme
import { DefaultTheme } from "react-native-paper"

const theme: typeof DefaultTheme = {
  ...DefaultTheme,
  dark: false,
  roundness: 4,
  colors: {
    ...DefaultTheme.colors,
    primary: '#c9046a',
    accent: '#c9046a',
    background: '#f6f3ff',
  },
};

export default theme;
