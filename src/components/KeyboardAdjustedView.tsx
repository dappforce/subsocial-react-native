//////////////////////////////////////////////////////////////////////
// A container view to workaround an issue in Storybook where the
// scene view would not be resized upon showing the keyboard.
import React, { useEffect, useMemo, useRef } from 'react'
import { Animated, Easing, Keyboard, KeyboardEventListener, Platform, StyleProp, StyleSheet, ViewProps, ViewStyle } from 'react-native'

export type KeyboardAdjustedViewProps = Animated.AnimatedProps<ViewProps> & {
  disabled?: boolean
  extraPadding?: number
  /** On Android, duration provided in KeyboardEvent is 0, so we use this instead */
  duration?: number
  adjustedStyle?: StyleProp<ViewStyle>
  disabledStyle?: StyleProp<ViewStyle>
}

export const KeyboardAdjustedView = React.memo(({
  children,
  disabled,
  duration: _duration = 300,
  extraPadding = 0,
  style: _style,
  disabledStyle,
}: KeyboardAdjustedViewProps) => {
  const duration = useRef<number>(0)
  const keyboardHeight = useMemo(() => new Animated.Value(0), [])
  const padding = useMemo(() => Animated.add(keyboardHeight, extraPadding), [ extraPadding ])
  const style = useMemo(() => {
    const res: Animated.AnimatedProps<ViewProps>['style'] = [styles.container]
    const animatedStyle: Animated.WithAnimatedObject<ViewStyle> = {
      paddingBottom: padding
    }
    
    if (disabled) {
      res.push(disabledStyle)
    }
    else {
      res.push(animatedStyle)
    }
    
    res.push(_style)
    
    return res
  }, [ disabled, _style, disabledStyle, padding ])
  
  useEffect(() => {
    duration.current = _duration
  }, [ _duration ])
  
  useEffect(() => {
    const onKeyboardShow: KeyboardEventListener = e => {
      Animated.timing(keyboardHeight, {
        duration: e.duration || duration.current,
        toValue: e.endCoordinates.height,
        useNativeDriver: false,
      }).start()
    }
    
    const onKeyboardHide: KeyboardEventListener = e => {
      Animated.timing(keyboardHeight, {
        duration: e.duration || duration.current,
        toValue: 0,
        useNativeDriver: false,
      }).start()
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
    <Animated.View style={style}>
      {children}
    </Animated.View>
  )
})

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
})
