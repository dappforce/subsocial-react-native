import React, { useMemo } from 'react'
import { StyleSheet, View } from 'react-native'
import { DefaultTheme, Text, Title, useTheme } from 'react-native-paper'

export default function() {
  const theme = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  return (
    <View style={styles.container}>
      <Title>Welcome to Subsocial RN</Title>
      <Text style={styles.content}>
        Subsocial RN is an example app built in
        {' '}<Text style={styles.emphasis}>React Native</Text>{' '}
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

const createStyles = (theme: typeof DefaultTheme) => StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    justifyContent: 'center',
  },
  content: {
    marginBottom: 10,
    lineHeight: 18,
  },
  emphasis: {
    fontStyle: 'italic',
    color: theme.colors.accent,
  },
});
