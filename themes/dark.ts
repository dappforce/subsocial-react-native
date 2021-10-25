//////////////////////////////////////////////////////////////////////
// Default Light Mode Theme
import { Theme } from '~comps/Theming'
import LightTheme from './light'

const theme: Theme = {
  ...LightTheme,
  colors: {
    ...LightTheme.colors,
    textPrimary: '#fff',
    textSecondary: '#8ca3b5',
    link: LightTheme.colors.appBar,
    background: '#121c26',
    scaffold: '#15202b',
    line: '#36404d',
    icon: '#8899a6',
  },
};

export default theme;
