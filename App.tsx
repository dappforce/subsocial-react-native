import React from 'react'
import { StyleSheet } from 'react-native'
import { Portal } from 'react-native-paper'
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context'
import { StatusBar } from 'expo-status-bar'
import { SubstrateProvider } from '~comps/SubstrateContext'
import { ThemeProvider } from '~comps/Theming'
import StorybookUI from './storybook'
import config from 'config.json'

import LightTheme from '~themes/light'
import DarkTheme from '~themes/dark'


export default function(props: {}) {
  // const scheme = useColorScheme();
  // const theme  = scheme === 'light' ? LightTheme : DarkTheme;
  const theme = LightTheme
  
  return (
    <ThemeProvider theme={theme}>
      <SubstrateProvider endpoint={config.connections.ws.substrate}>
        <SafeAreaProvider>
          <StatusBar backgroundColor={theme.colors.appBar} />
          <SafeAreaView style={[styles.container, {backgroundColor: theme.colors.background}]}>
            <Portal.Host>
              <StorybookUI {...props} />
            </Portal.Host>
          </SafeAreaView>
        </SafeAreaProvider>
      </SubstrateProvider>
    </ThemeProvider>
  )
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    height: '100%',
  },
});
