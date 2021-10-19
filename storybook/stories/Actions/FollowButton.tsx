//////////////////////////////////////////////////////////////////////
// General purpose FollowButton encompassing following & follow-state
// logic.
// TODO: Following requires SUB -> requires transactions -> requires wallet
// TODO: When following, switch mode to "outline"
import React, { useCallback } from 'react'
import { StyleProp, TextStyle } from 'react-native'
import { Icon } from 'react-native-elements'
import { Button, ButtonProps } from '~comps/Typography'

export type FollowButtonProps<T> = Omit<ButtonProps, 'children' | 'onPress'> & {
  /** Context-sensitive ID to pass back upon press. The context should know what the ID belongs to (Account, Space). */
  id: T
  onPress: (props: {id: T, isFollowing: boolean}) => void
  isFollowing: boolean
  loading?: boolean
  hideIcon?: boolean
}
export function FollowButton<T>({
  id,
  onPress,
  isFollowing,
  loading = false,
  hideIcon = false,
  labelStyle,
  ...props
}: FollowButtonProps<T>)
{
  const _onPress = useCallback(() => onPress({id, isFollowing}), [id, isFollowing, onPress]);
  
  const btnProps: ButtonProps = {
    ...props,
    children: isFollowing ? "Unfollow" : "Follow",
    mode: isFollowing ? "outlined" : "contained",
    loading,
    onPress: _onPress,
    labelStyle: [{fontSize: 15}, !hideIcon && {marginLeft: 8}, labelStyle]
  };
  
  // need this branch because the mere presence of the "icon" prop already alters appearance
  if (!hideIcon) {
    btnProps.icon = ({size, color}) => <Icon name="people-circle-outline" type="ionicon" {...{size, color}} />
  }
  
  return Button(btnProps);
}
