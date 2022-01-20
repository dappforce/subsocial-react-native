//////////////////////////////////////////////////////////////////////
// A container view to workaround an issue in Storybook where the
// scene view would not be resized upon showing the keyboard.
import React, { useEffect, useMemo, useRef, useState } from 'react'
import { Keyboard, KeyboardEventListener, Platform, StyleProp, StyleSheet, View, ViewProps, ViewStyle } from 'react-native'

export type KeyboardAdjustedViewProps = ViewProps & {
  disabled?: boolean
  extraPadding?: number
  adjustedStyle?: StyleProp<ViewStyle>
  disabledStyle?: StyleProp<ViewStyle>
}

export const KeyboardAdjustedView = React.memo(({
  children,
  disabled,
  extraPadding = 0,
  style: _style,
  disabledStyle,
}: KeyboardAdjustedViewProps) => {
  const [ keyboardHeight, setKeyboardHeight ] = useState(0)
  const style = useMemo(() => {
    const res: StyleProp<ViewStyle> = [styles.container]
    const animatedStyle: ViewStyle = {
      paddingBottom: keyboardHeight,
    }
    
    if (disabled) {
      res.push(disabledStyle)
    }
    else {
      res.push(animatedStyle)
    }
    
    res.push(_style)
    
    return res
  }, [ disabled, _style, disabledStyle, keyboardHeight ])
  
  useEffect(() => {
    const onKeyboardShow: KeyboardEventListener = e => {
      setKeyboardHeight(e.endCoordinates.height + extraPadding)
    }
    
    const onKeyboardHide: KeyboardEventListener = e => {
      setKeyboardHeight(0)
    }
    
    if (Platform.OS === 'android') {
      Keyboard.addListener('keyboardDidShow', onKeyboardShow)
      Keyboard.addListener('keyboardDidHide', onKeyboardHide)
    }
    else {
      Keyboard.addListener('keyboardWillShow', onKeyboardShow)
      Keyboard.addListener('keyboardWillHide', onKeyboardHide)
    }
    
    return () => {
      if (Platform.OS === 'android') {
        Keyboard.removeListener('keyboardDidShow', onKeyboardShow)
        Keyboard.removeListener('keyboardDidHide', onKeyboardHide)
      }
      else {
        Keyboard.removeListener('keyboardWillShow', onKeyboardShow)
        Keyboard.removeListener('keyboardWillHide', onKeyboardHide)
      }
    }
  }, [])
  
  return (
    <View style={style}>
      {children}
    </View>
  )
})

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
})
