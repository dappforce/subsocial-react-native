import React from 'react'
import { StyleSheet } from 'react-native'
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context'
import { StatusBar } from 'expo-status-bar'
import { SubstrateProvider } from '~comps/SubstrateContext'
import { ThemeProvider } from '~comps/Theming'
import { Provider as ReduxProvider } from 'react-redux'
import store from 'src/rtk/app/store'
import StorybookUI from './storybook'
import config from 'config.json'

import LightTheme from '~themes/light'
import DarkTheme from '~themes/dark'


export default function(props: {}) {
  // const scheme = useColorScheme();
  // const theme  = scheme === 'light' ? LightTheme : DarkTheme;
  const theme = LightTheme
  
  return (
    <ReduxProvider store={store}>
      <ThemeProvider theme={theme}>
        <SubstrateProvider endpoint={config.connections.ws.substrate}>
          <SafeAreaProvider>
            <StatusBar backgroundColor={theme.colors.appBar} />
            <SafeAreaView style={[styles.container, {backgroundColor: theme.colors.background}]}>
              <StorybookUI {...props} />
            </SafeAreaView>
          </SafeAreaProvider>
        </SubstrateProvider>
      </ThemeProvider>
    </ReduxProvider>
  )
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    height: '100%',
  },
});
