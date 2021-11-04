//////////////////////////////////////////////////////////////////////
// General purpose FollowButton encompassing following & follow-state
// logic.
// TODO: Following requires SUB -> requires transactions -> requires wallet
// TODO: When following, switch mode to "outline"
import React, { useCallback } from 'react'
import { Icon } from 'react-native-elements'
import { EntityId } from 'src/types/subsocial';
import { Button, ButtonProps } from '~comps/Typography'

export type FollowButtonProps = Omit<ButtonProps, 'children' | 'onPress'> & {
  id: EntityId
  onPress: (props: {id: EntityId, isFollowing: boolean}) => void
  isFollowing: boolean
  loading?: boolean
  showIcon?: boolean
}
export function FollowButton({
  id,
  onPress,
  isFollowing,
  loading = false,
  showIcon = false,
  labelStyle,
  ...props
}: FollowButtonProps)
{
  const _onPress = useCallback(() => {
    onPress({ id, isFollowing })
  }, [ id, isFollowing, onPress ])
  
  const btnProps: ButtonProps = {
    ...props,
    children: isFollowing ? "Unfollow" : "Follow",
    mode: isFollowing ? "outlined" : "contained",
    loading,
    onPress: _onPress,
    labelStyle: [
      { fontSize: 15 },
      showIcon && { marginLeft: 8 },
      labelStyle
    ]
  }
  
  // need this branch because the mere presence of the "icon" prop already alters appearance
  if (showIcon) {
    btnProps.icon = ({ size, color }) => <Icon name="people-circle-outline" type="ionicon" {...{ size, color }} />
  }
  
  return Button(btnProps)
}
