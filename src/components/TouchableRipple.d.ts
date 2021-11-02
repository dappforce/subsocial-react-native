import React from 'react'
import { GestureResponderEvent, Pressable, PressableProps, StyleProp, ViewStyle } from 'react-native'
import { Rect } from 'src/types'

// Props shared or normalized between Pressable & TouchableHighlight
export type TouchableRippleProps = React.PropsWithChildren<{
  onPress?:     (evt: GestureResponderEvent) => void
  onLongPress?: (evt: GestureResponderEvent) => void
  onPressIn?:   (evt: GestureResponderEvent) => void
  onPressOut?:  (evt: GestureResponderEvent) => void
  disabled?: boolean
  hitSlop?: Rect | number
  pressRetentionOffset?: Rect | number
  style?: StyleProp<ViewStyle>
  rippleSize?: number
  rippleBorderless?: boolean
  underlayColor?: string
}>
export const TouchableRipple: React.FC<TouchableRippleProps>
