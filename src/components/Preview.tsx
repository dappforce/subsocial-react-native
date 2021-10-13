//////////////////////////////////////////////////////////////////////
// Generic preview component - uses linear gradient to fake fading
// into the void
import React, { useState } from 'react'
import { LayoutChangeEvent, StyleProp, StyleSheet, View, ViewProps, ViewStyle } from 'react-native'
import { LinearGradient } from 'expo-linear-gradient'
import { useTheme } from './Theming'

export type PreviewProps = ViewProps & React.PropsWithChildren<{
  height: number
  style?: StyleProp<ViewStyle>
}>
export default function Preview({children, height, style, ...props}: PreviewProps) {
  const theme = useTheme();
  const [showGradient, setShowGradient] = useState(true);
  const onLayout = (evt: LayoutChangeEvent) => {
    setShowGradient(Math.round(evt.nativeEvent.layout.height) > height);
  }
  
  return (
    <View {...props} style={[styles.preview, {height}, style]}>
      <View onLayout={onLayout}>
        {children}
      </View>
      {showGradient && <LinearGradient
        colors={['transparent', theme.colors.background]}
        style={styles.fader}
      />}
    </View>
  )
}

const styles = StyleSheet.create({
  preview: {
    overflow: 'hidden',
  },
  fader: {
    position: 'absolute',
    height: 50,
    bottom: 0,
    left: 0,
    right: 0,
  },
})
