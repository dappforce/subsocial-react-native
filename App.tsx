import React, { useMemo } from 'react'
import { StyleSheet } from 'react-native'
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context'
import { StatusBar } from 'expo-status-bar'
import AppLoading from 'expo-app-loading'
import { SubstrateProvider } from '~comps/SubstrateContext'
import { ThemeProvider } from '~comps/Theming'
import { Provider as ReduxProvider } from 'react-redux'
import { useFonts } from 'expo-font'
import store from 'src/rtk/app/store'
import StorybookUI from './storybook'
import config from 'config.json'

import LightTheme from '~themes/light'
import DarkTheme from '~themes/dark'


export default function(props: {}) {
  // const scheme = useColorScheme();
  // const theme  = scheme === 'light' ? LightTheme : DarkTheme;
  const theme = LightTheme
  const [fontsLoaded] = useFonts({
    Roboto: require('./assets/fonts/Roboto-Regular.ttf'),
    Roboto500: require('./assets/fonts/Roboto-Medium.ttf'),
  })
  const ready = useMemo(() => fontsLoaded, [ fontsLoaded ])
  
  if (!ready) {
    return <AppLoading />
  }
  
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
