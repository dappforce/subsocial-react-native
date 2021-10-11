import React, { useMemo } from 'react'
import { StyleSheet, useColorScheme } from 'react-native'
import { Provider as PaperProvider } from 'react-native-paper'
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context'
import { StatusBar } from 'expo-status-bar'
import { SubstrateProvider } from '~comps/SubstrateContext'
import StorybookUI from './storybook'
import config from 'config.json'

import LightTheme from '~themes/light'
import DarkTheme from '~themes/dark'


export default function(props: {}) {
  const scheme = useColorScheme();
  const theme  = scheme === 'light' ? LightTheme : DarkTheme;
  const bgc    = useMemo(() => theme.colors.background, [theme]);
  
  return (
    <PaperProvider theme={theme}>
      <SubstrateProvider endpoint={config.connections.ws.substrate}>
        <SafeAreaProvider>
          <StatusBar backgroundColor={theme.colors.primary} />
          <SafeAreaView style={[styles.container, {backgroundColor: bgc}]}>
            <StorybookUI {...props} />
          </SafeAreaView>
        </SafeAreaProvider>
      </SubstrateProvider>
    </PaperProvider>
  )
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    height: '100%',
  },
});
