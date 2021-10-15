//////////////////////////////////////////////////////////////////////
// General purpose FollowButton encompassing following & follow-state
// logic.
// TODO: Following requires SUB -> requires transactions -> requires wallet
// TODO: When following, switch mode to "outline"
import React, { useCallback } from 'react'
import { Icon } from 'react-native-elements'
import { Button, ButtonProps } from '~comps/Typography'

export type FollowButtonProps<T> = {
  /** Context-sensitive ID to pass back upon press. The context should know what the ID belongs to (Account, Space). */
  id: T
  onPress: (id: T) => void
  hideIcon?: boolean
}
export default function FollowButton<T>({id, onPress, hideIcon = false}: FollowButtonProps<T>) {
  const _onPress = useCallback(() => onPress(id), [id, onPress]);
  
  const btnProps: ButtonProps = {
    children: 'Follow',
    mode: "contained",
    onPress: _onPress,
  };
  
  // need this branch because the mere presence of the "icon" prop already alters appearance
  if (!hideIcon) {
    btnProps.icon = ({size, color}) => <Icon name="people-circle-outline" type="ionicon" {...{size, color}} />
  }
  
  return Button(btnProps);
}
