import React from 'react'
import { StyleSheet } from 'react-native'
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context'
import { SubstrateProvider } from './src/components/SubstrateContext'
import StorybookUI from './storybook'
import config from 'config.json'


export default function(props: Object) {
  return (
    <SubstrateProvider endpoint={config.connections.ws.substrate}>
      <SafeAreaProvider>
        <SafeAreaView style={styles.container}>
          <StorybookUI {...props} />
        </SafeAreaView>
      </SafeAreaProvider>
    </SubstrateProvider>
  )
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    height: '100%',
  },
});
