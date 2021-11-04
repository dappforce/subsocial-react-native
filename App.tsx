import React, { useMemo } from 'react'
import { StyleSheet } from 'react-native'
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context'
import { NavigationContainer } from '@react-navigation/native'
import { StatusBar } from 'expo-status-bar'
import AppLoading from 'expo-app-loading'
import { SubstrateProvider } from '~comps/SubstrateContext'
import { reduceNavigationTheme, ThemeProvider } from '~comps/Theming'
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
  const dark = false
  const theme = LightTheme
  
  const [ fontsLoaded ] = useFonts({
    Roboto: require('./assets/fonts/Roboto-Regular.ttf'),
    RobotoItalic: require('./assets/fonts/Roboto-Italic.ttf'),
    RobotoMedium: require('./assets/fonts/Roboto-Medium.ttf'),
    RobotoBold: require('./assets/fonts/Roboto-Bold.ttf'),
  })
  
  const ready = fontsLoaded
  
  if (!ready) {
    return <AppLoading />
  }
  
  return (
    <ReduxProvider store={store}>
      <ThemeProvider theme={theme} dark={dark}>
        <SubstrateProvider endpoint={config.connections.ws.substrate}>
          <SafeAreaProvider>
            <NavigationContainer theme={reduceNavigationTheme(theme, dark)}>
              <StatusBar backgroundColor={theme.colors.appBar} />
              <SafeAreaView style={[ styles.container, { backgroundColor: theme.colors.background } ]}>
                <StorybookUI {...props} />
              </SafeAreaView>
            </NavigationContainer>
          </SafeAreaProvider>
        </SubstrateProvider>
      </ThemeProvider>
    </ReduxProvider>
  )
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    height: '100%',
  },
})
