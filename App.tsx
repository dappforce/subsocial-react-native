import React from 'react';
import { StyleSheet } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import StorybookUI from './storybook';

export default function(props: Object) {
  return (
    <SafeAreaProvider>
      <SafeAreaView style={styles.container}>
        <StorybookUI {...props} />
      </SafeAreaView>
    </SafeAreaProvider>
  )
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    height: '100%',
  },
});
