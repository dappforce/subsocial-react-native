import React, { Component } from 'react'
import { StyleSheet, View, Text } from 'react-native'

export interface WelcomeProps {
  showApp?: () => void;
}

export default class Welcome extends Component<WelcomeProps> {
  render(): React.ReactNode {
    const { showApp } = this.props;
    
    return (
      <View style={styles.container}>
        <Text style={styles.header}>Welcome to Subsocial RN</Text>
        <Text style={styles.content}>
          Subsocial RN is an example app built in
          <Text style={styles.italic}>React Native</Text>
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
    );
  }
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
