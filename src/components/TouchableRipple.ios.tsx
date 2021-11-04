//////////////////////////////////////////////////////////////////////
// iOS version of TouchableRipple (currently) simply falls back to
// TouchableHighlight
import React from 'react'
import { TouchableHighlight } from 'react-native'
import { TouchableRippleProps } from './TouchableRipple'
import { Opt, Rect } from 'src/types'

export function TouchableRipple({ pressRetentionOffset, hitSlop, rippleSize, rippleBorderless, ...props }: TouchableRippleProps) {
  return (
    <TouchableHighlight
      {...props}
      hitSlop={toRect(hitSlop)}
      pressRetentionOffset={toRect(pressRetentionOffset)}
    />
  )
}

function toRect(v: Opt<number | Rect>): Opt<Rect> {
  if (!v) return undefined
  
  if (typeof v === 'object') {
    const res: Rect = {}
    if ('top'    in v) res.top    = v.top
    if ('left'   in v) res.left   = v.left
    if ('right'  in v) res.right  = v.right
    if ('bottom' in v) res.bottom = v.bottom
    return res
  }
  
  else {
    return {
      top: v,
      left: v,
      right: v,
      bottom: v,
    }
  }
}
