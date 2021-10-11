//////////////////////////////////////////////////////////////////////
// Default Light Mode Theme
import { DefaultTheme } from "react-native-paper"

const theme: typeof DefaultTheme = {
  ...DefaultTheme,
  dark: false,
  roundness: 4,
  colors: {
    ...DefaultTheme.colors,
    primary: 'rgba(107,17,107,0.80)',
    accent: '#c9046a',
    background: '#f6f3ff',
  },
};

export default theme;
