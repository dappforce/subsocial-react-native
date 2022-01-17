import './polyfill'

import React, { useEffect } from 'react'
import { StyleSheet } from 'react-native'
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context'
import { NavigationContainer } from '@react-navigation/native'
import { BottomSheetModalProvider } from '@gorhom/bottom-sheet'
import { Provider as ReduxProvider } from 'react-redux'
import { StatusBar } from 'expo-status-bar'
import AppLoading from 'expo-app-loading'
import * as Linking from 'expo-linking'
import { SubstrateProvider } from '~comps/SubstrateContext'
import { reduceNavigationTheme, ThemeProvider } from '~comps/Theming'
import { MainScreen } from '~stories/Screens'
import { SubsocialProvider } from '~comps/SubsocialContext'
import { ModalPortal } from '~stories/Modals'
import { useFonts } from 'expo-font'
import store from 'src/rtk/app/store'
import StorybookUI from './storybook'
import config from 'config.json'
import { useIntervalReport } from 'uniprofiler/react'

import LightTheme from '~themes/light'
import DarkTheme from '~themes/dark'

const deeplinkConfig = {
  screens: {
    Account: 'accounts/:accountId',
    Post: {
      path: ':spaceId/:postId',
      parse: {
        postId: (id: string) => {
          console.log(id)
          return id.split('-').pop()
        },
      },
    },
    Space: ':spaceId',
  }
}


export default function(props: {}) {
  const storybook = __DEV__
  // const scheme = useColorScheme();
  // const theme  = scheme === 'light' ? LightTheme : DarkTheme;
  const dark = false
  const theme = LightTheme
  
  const [ fontsLoaded ] = useFonts({
    Roboto: require('./assets/fonts/Roboto-Regular.ttf'),
    RobotoItalic: require('./assets/fonts/Roboto-Italic.ttf'),
    RobotoMedium: require('./assets/fonts/Roboto-Medium.ttf'),
    RobotoBold: require('./assets/fonts/Roboto-Bold.ttf'),
    Subicon: require('./assets/fonts/subicons.ttf'),
  })
  
  const ready = fontsLoaded
  
  // useIntervalReport()
  
  if (!ready) {
    return <AppLoading />
  }
  
  const linking = {
    prefixes: config.deeplink.prefixes,
    config: deeplinkConfig,
  }
  
  return (
    <ReduxProvider store={store}>
      <ThemeProvider theme={theme} dark={dark}>
        <SubstrateProvider endpoint={config.connections.ws.substrate}>
          <SafeAreaProvider>
            <ModalPortal />
            <NavigationContainer linking={linking} theme={reduceNavigationTheme(theme, dark)}>
              <StatusBar backgroundColor={theme.colors.appBar} />
              <SafeAreaView style={[ styles.container, { backgroundColor: theme.colors.background } ]}>
                <BottomSheetModalProvider>
                  {storybook
                  ? <StorybookUI {...props} />
                  : <SubsocialProvider>
                      <MainScreen />
                    </SubsocialProvider>
                  }
                </BottomSheetModalProvider>
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
