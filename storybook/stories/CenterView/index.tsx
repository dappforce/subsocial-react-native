import React, { ReactNode } from 'react'
import { StyleProp, StyleSheet, ViewStyle } from 'react-native'
import { View } from 'react-native'

export interface CenterViewProps {
  children: ReactNode | ReactNode[]
  style?: StyleProp<ViewStyle>
}

export default function CenterView({children, style}: CenterViewProps) {
  return <View style={[styles.container, style]}>{children}</View>;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
