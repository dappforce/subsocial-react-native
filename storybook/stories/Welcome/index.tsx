import React, { useMemo } from 'react'
import { StyleSheet, View } from 'react-native'
import { Span, Text, Title } from '~comps/Typography'

export default function() {
  return (
    <View style={styles.container}>
      <Title style={styles.title}>Welcome to Subsocial RN</Title>
      <Text style={styles.content}>
        Subsocial RN is an example app built in
        {' '}<Span>React Native</Span>{' '}
        for the Subsocial Ecosystem.
      </Text>
      <Text style={styles.content}>
        The purpose of this app is to demonstrate how one would go
        about creating their own.
      </Text>
      <Text style={styles.content}>
        This app was built with Storybook for React Native. It is
        not a requirement for your own Subsocial app.
      </Text>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    justifyContent: 'center',
  },
  content: {
    marginBottom: 10,
    lineHeight: 18,
  },
  title: {
    marginBottom: 10,
  },
})
