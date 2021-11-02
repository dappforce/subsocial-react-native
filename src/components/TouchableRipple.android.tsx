//////////////////////////////////////////////////////////////////////
// Like RNP's TouchableRipple except we use RN's Pressable & expose
// android_ripple options.
// TODO: add ripple to iOS with RN Advanced Ripple?
import React, { useMemo } from 'react'
import { Pressable, PressableAndroidRippleConfig } from 'react-native'
import { TouchableRippleProps } from './TouchableRipple'

export function TouchableRipple({rippleSize = 40, rippleBorderless = false, underlayColor, ...props}: TouchableRippleProps) {
  const android_ripple = useMemo<PressableAndroidRippleConfig>(() => {
    return {
      radius: rippleSize,
      borderless: rippleBorderless,
    }
  }, [ rippleSize, rippleBorderless ])
  
  return (
    <Pressable
      {...props}
      android_ripple={android_ripple}
    />
  )
}
