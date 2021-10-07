import React, { useMemo } from 'react'
import { ColorSchemeName, StyleSheet, useColorScheme } from 'react-native'
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context'
import { StatusBar } from 'expo-status-bar'
import { SubstrateProvider } from '~comps/SubstrateContext'
import { BackgroundColorProvider } from '~comps/BackgroundColorContext'
import StorybookUI from './storybook'
import config from 'config.json'


export default function(props: {}) {
  const scheme = useColorScheme();
  const bgc    = backgroundColor(scheme);
  const styles = useMemo(() => createStyles(bgc), [scheme]);
  
  return (
    <BackgroundColorProvider color={bgc}>
      <SubstrateProvider endpoint={config.connections.ws.substrate}>
        <SafeAreaProvider>
          <StatusBar backgroundColor={bgc} />
          <SafeAreaView style={styles.container}>
            <StorybookUI {...props} />
          </SafeAreaView>
        </SafeAreaProvider>
      </SubstrateProvider>
    </BackgroundColorProvider>
  )
};

const backgroundColor = (scheme: ColorSchemeName) => scheme === 'light' ? '#f6f3ff' : '#150527';
const createStyles = (bgc: string) => StyleSheet.create({
  container: {
    backgroundColor: bgc,
    width: '100%',
    height: '100%',
  },
});
