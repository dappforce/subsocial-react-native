//////////////////////////////////////////////////////////////////////
// Default Light Mode Theme
import { Theme } from "~comps/Theming"

const theme: Theme = {
  colors: {
    primary: '#eb2f96',
    secondary: '#eb2f96',
    textPrimary: '#222',
    textSecondary: '#888',
    textDisabled: '#cdc9c9',
    link: '#bd018b',
    background: '#fafafa',
    backgroundMenu: '#eeecec',
    backgroundMenuHover: '#FFF0F6',
    backdrop: '#eeecec',
    scaffold: '#fff',
    appBar: '#c03494',
    line: '#ddd',
    divider: '#eeecec',
    icon: '#262626',
    socials: '#262626',
  },
  consts: {
    roundness: 4,
  },
  fonts: {
    primary: {
      fontFamily: 'Roboto',
      fontStyle:  'normal',
      fontWeight: 'normal',
      fontSize: 17,
      lineHeight: 17*1.25,
    },
    secondary: {
      fontFamily: 'Roboto',
      fontStyle:  'normal',
      fontWeight: 'normal',
      fontSize: 14,
      lineHeight: 14*1.25,
    },
    titleDetails: {
      fontFamily: 'Roboto',
      fontStyle:  'normal',
      fontWeight: '500',
      fontSize: 22,
      lineHeight: 22*1.25,
    },
    titlePreview: {
      fontFamily: 'Roboto',
      fontStyle:  'normal',
      fontWeight: '500',
      fontSize: 19,
      lineHeight: 19*1.25,
    },
    button: {
      fontFamily: 'Roboto',
      fontStyle:  'normal',
      fontWeight: '500',
      fontSize: 17,
      lineHeight: 17*1.25,
    },
    profileName: {
      fontFamily: 'Roboto',
      fontStyle:  'normal',
      fontWeight: '500',
      fontSize: 17,
      lineHeight: 17*1.25,
    },
  }
};

export default theme;
