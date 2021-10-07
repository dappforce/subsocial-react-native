import React, { useMemo } from 'react'
import { ColorSchemeName, StyleSheet, useColorScheme } from 'react-native'
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context'
import { StatusBar } from 'expo-status-bar'
import { SubstrateProvider } from './src/components/SubstrateContext'
import StorybookUI from './storybook'
import config from 'config.json'


export default function(props: {}) {
  const scheme = useColorScheme();
  const styles = useMemo(() => createStyles(scheme), [scheme]);
  
  return (
    <SubstrateProvider endpoint={config.connections.ws.substrate}>
      <SafeAreaProvider>
        <StatusBar backgroundColor={backgroundColor(scheme)} />
        <SafeAreaView style={styles.container}>
          <StorybookUI {...props} />
        </SafeAreaView>
      </SafeAreaProvider>
    </SubstrateProvider>
  )
};

const backgroundColor = (scheme: ColorSchemeName) => scheme === 'light' ? 'hsl(271, 84%, 92%)' : 'hsl(250, 10%, 4%)';
const createStyles = (scheme: ColorSchemeName) => StyleSheet.create({
  container: {
    backgroundColor: backgroundColor(scheme),
    width: '100%',
    height: '100%',
  },
});
