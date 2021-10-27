//////////////////////////////////////////////////////////////////////
// An ActivityIndicator spanning the available area with flex: 1
import React from 'react'
import { StyleSheet, View } from 'react-native'
import { ActivityIndicator } from 'react-native-paper'
import { useTheme } from './Theming'

export type SpanningActivityIndicatorProps = {}
export function SpanningActivityIndicator({}: SpanningActivityIndicatorProps) {
  const theme = useTheme()
  return (
    <View style={styles.container}>
      <ActivityIndicator color={theme.colors.primary} />
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
})
