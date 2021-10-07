import React from 'react'
import { StyleSheet, View } from 'react-native'
import SubsocialText from '../SubsocialText';

export default function() {
  return (
    <View style={styles.container}>
      <SubsocialText style={styles.header}>Welcome to Subsocial RN</SubsocialText>
      <SubsocialText style={styles.content}>
        Subsocial RN is an example app built in
        {' '}<SubsocialText style={styles.italic}>React Native</SubsocialText>{' '}
        for the Subsocial Ecosystem.
      </SubsocialText>
      <SubsocialText style={styles.content}>
        The purpose of this app is to demonstrate how one would go
        about creating their own.
      </SubsocialText>
      <SubsocialText style={styles.content}>
        This app was built with Storybook for React Native. It is
        not a requirement for your own Subsocial app.
      </SubsocialText>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    justifyContent: 'center',
  },
  header: {
    fontSize: 18,
    marginBottom: 18,
  },
  content: {
    fontSize: 12,
    marginBottom: 10,
    lineHeight: 18,
  },
  italic: {
    fontStyle: 'italic',
    color: '#037fc6'
  },
});
