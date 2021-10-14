
import React from 'react'
import * as RN from 'react-native'

export type AnimationConfig = {
  /** default: 14 */
  speed: number
  /** default: 4 */
  bounciness: number
}

export type SwipeConfig = {
  /** Velocity that has to be breached in order for swipe to be triggered (`vx` and `vy` properties of `gestureState`). Default: 0.3 */
  velocityThreshold: number
  
  /** Absolute offset that shouldn't be breached for swipe to be triggered (`dy` for horizontal swipe, `dx` for vertical swipe). Default: 80 */
  directionalOffsetThreshold: number
}

export type BackdropProps = {
  /** Content of backdrop (required) */
  children: React.ReactNode
  
  /** Content of backdrop (required) */
  visible: boolean
  
  /** Function to open backdrop (required, function) */
  handleOpen: () => void
  
  /** Function to close backdrop (required, function) */
  handleClose: () => void
  
  /** Callback that is called before close animation */
  beforeClose?: () => void
  
  /** Callback that is called after close animation */
  afterClose?: () => void
  
  /** Callback that is called before open animation */
  beforeOpen?: () => void
  
  /** Callback that is called after open animation */
  afterOpen?: () => void
  
  /** Configures Open and Close Animation speed and bounciness */
  animationConfig?: AnimationConfig
  
  /** Configures Swipe Gesture to close backdrop */
  swipeConfig?: SwipeConfig
  
  /** Style object for backdrop styling */
  backdropStyle?: RN.StyleProp<RN.ViewStyle>
  
  /** Style object for container styling */
  containerStyle?: RN.StyleProp<RN.ViewStyle>
  
  /** Display custom header in backdrop */
  header?: () => React.ReactElement
  
  /** Height of closed backdrop that will be visible and touchable. Default: 0 */
  closedHeight?: number
  
  /** Close backdrop on back button press on android. Default: false */
  closeOnBackButton?: boolean
}

export class Backdrop extends React.Component<BackdropProps> {}
