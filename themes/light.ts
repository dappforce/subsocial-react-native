//////////////////////////////////////////////////////////////////////
// Default Light Mode Theme
import { Theme } from "~comps/Theming"

const theme: Theme = {
  colors: {
    primary: '#eb2f96',
    secondary: '#eb2f96',
    textPrimary: '#222',
    textSecondary: '#a0a0a0',
    textDisabled: '#cdc9c9',
    link: '#bd018b',
    background: '#fafafa',
    backgroundMenu: '#f0f0f0',
    backgroundMenuHover: '#FFF0F6',
    backdrop: '#22222299',
    scaffold: '#fff',
    appBar: '#c03494',
    line: '#ddd',
    divider: '#bbb',
    icon: '#262626',
    socials: '#a0a0a0',
    confirmation: '#3baa54',
  },
  consts: {
    roundness: 4,
  },
  fonts: {
    primary: {
      fontFamily: 'Roboto',
      fontSize: 17,
      lineHeight: 17*1.25,
    },
    secondary: {
      fontFamily: 'Roboto',
      fontSize: 14,
      lineHeight: 14*1.25,
    },
    titleDetails: {
      fontFamily: 'RobotoMedium',
      fontSize: 22,
      lineHeight: 22*1.25,
    },
    titlePreview: {
      fontFamily: 'RobotoMedium',
      fontSize: 19,
      lineHeight: 19*1.25,
    },
    button: {
      fontFamily: 'RobotoMedium',
      fontSize: 17,
      lineHeight: 17*1.25,
    },
    profileName: {
      fontFamily: 'RobotoMedium',
      fontSize: 17,
      lineHeight: 17*1.25,
    },
  }
}

export default theme
