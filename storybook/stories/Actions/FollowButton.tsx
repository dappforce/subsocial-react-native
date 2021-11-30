//////////////////////////////////////////////////////////////////////
// General purpose FollowButton encompassing following & follow-state
// logic.
import React, { useCallback, useState } from 'react'
import { StyleProp, TextStyle } from 'react-native'
import { useInit } from '~comps/hooks'
import { useCreateReloadAccountIdsByFollower, useSelectAccountIdsByFollower, useSelectKeypair } from 'src/rtk/app/hooks'
import { useSubstrate } from '~comps/SubstrateContext'
import { AccountId, EntityId, SpaceId } from 'src/types/subsocial'
import { Button, ButtonProps } from '~comps/Typography'
import { Icon } from '~comps/Icon'
import { LoginPrompt } from './LoginPrompt'
import { send as sendTx } from 'src/tx'
import { assertDefinedSoft } from 'src/util'
import { useCreateReloadSpaceIdsByFollower, useSelectSpaceIdsByFollower } from 'src/rtk/features/spaceIds/followedSpaceIdsHooks'

export class FollowEvent {
  private _isDefaultPrevented = false
  
  constructor(public readonly isFollowing: boolean) {}
  
  get isDefaultPrevented() {
    return this._isDefaultPrevented
  }
  
  preventDefault() {
    this._isDefaultPrevented = true
  }
}

export type CommonFollowButtonProps = Omit<ButtonProps, 'children' | 'onPress' | 'icon'> & {
  onPress?: (e: FollowEvent) => void
  onFollow?: (e: FollowEvent) => void
  onUnfollow?: (e: FollowEvent) => void
  showIcon?: boolean
}

export type GenericFollowButtonProps = {
  targetId: EntityId
  follows: EntityId[]
  reloadFollows: (myAddress: string) => void
  followTx: string
  unfollowTx: string
}

export type FollowButtonBaseProps = Omit<ButtonProps, 'children' | 'onPress' | 'icon'> & {
  isFollowing: boolean
  showIcon?: boolean
  labelStyle?: StyleProp<TextStyle>
  onPress: () => void
}
export function FollowButtonBase({
  isFollowing,
  showIcon,
  labelStyle,
  onPress,
  ...props
}: FollowButtonBaseProps)
{
  const extraProps: Partial<ButtonProps> = {
    ...props,
    onPress,
  }
  
  // need this branch because the mere presence of the "icon" prop already alters appearance
  if (showIcon) {
    extraProps.icon = ({ size, color }) => {
      return (
        <Icon
          family="subicon"
          name={isFollowing ? 'followed' : 'follow'}
          size={size}
          color={color}
        />
      )
    }
  }
  
  return (
    <Button
      {...extraProps}
      mode={isFollowing ? 'outlined' : 'contained'}
      labelStyle={[
        { fontSize: 15 },
        showIcon && { marginLeft: 14 },
        labelStyle
      ]}
    >
      {isFollowing ? "Following" : "Follow"}
    </Button>
  )
}

export function FollowButton({
  targetId,
  follows,
  reloadFollows,
  followTx,
  unfollowTx,
  
  onPress: _onPress,
  onFollow,
  onUnfollow,
  showIcon = false,
  ...props
}: CommonFollowButtonProps & GenericFollowButtonProps)
{
  const { api } = useSubstrate() ?? {}
  const { address } = useSelectKeypair() ?? {}
  const isFollowing = !!address && follows.includes(targetId)
  
  const [ showLoginPrompt, setShowLoginPrompt] = useState(false)
  const [ isLoading, setIsLoading ] = useState(false)
  
  const initialized = useInit(async () => {
    if (follows || !address) return true
    
    if (!api || !reloadFollows) return false
    
    await reloadFollows(address)
    return true
  }, [ targetId ], [ api, address, follows, reloadFollows ])
  
  const onPress = useCallback(async () => {
    if (!address) {
      setShowLoginPrompt(true)
      return
    }
    
    if (!assertDefinedSoft(api, { symbol: 'api', tag: 'FollowButton/onPress/api' }) ||
        !assertDefinedSoft(reloadFollows, { symbol: 'reloadFollows', tag: 'FollowButton/onPress/reloadFollows' })
    ) {
      return
    }
    
    setIsLoading(true)
    const evt = new FollowEvent(!isFollowing)
    await _onPress?.(evt)
    
    try {
      if (!evt.isDefaultPrevented) {
        await sendTx({
          api,
          tx: isFollowing
            ? unfollowTx
            : followTx,
          args: [ targetId ],
        })
        await reloadFollows(address)
        
        if (isFollowing) {
          onUnfollow?.(evt)
        }
        else {
          onFollow?.(evt)
        }
      }
    }
    
    finally {
      setIsLoading(false)
    }
  }, [ targetId, address, unfollowTx, followTx, isFollowing, _onPress, onFollow, onUnfollow ])
  
  return (
    <>
      <FollowButtonBase
        {...props}
        loading={!initialized || isLoading}
        isFollowing={isFollowing}
        showIcon={showIcon}
        onPress={onPress}
      />
      <LoginPrompt visible={showLoginPrompt} onClose={() => setShowLoginPrompt(false)} />
    </>
  )
}

export type FollowAccountButtonProps = Omit<CommonFollowButtonProps, 'loading'> & {
  id: AccountId
}
export const FollowAccountButton = React.memo(({ id, ...props }: FollowAccountButtonProps) => {
  const { address } = useSelectKeypair() ?? {}
  const follows = useSelectAccountIdsByFollower(address ?? '')
  const reloadFollows = useCreateReloadAccountIdsByFollower()
  
  return (
    <FollowButton
      {...props}
      targetId={id}
      follows={follows}
      reloadFollows={(address) => reloadFollows?.(address)}
      followTx="profileFollows.followAccount"
      unfollowTx="profileFollows.unfollowAccount"
    />
  )
})

export type FollowSpaceButtonProps = Omit<CommonFollowButtonProps, 'loading'> & {
  id: SpaceId
}
export const FollowSpaceButton = React.memo(({ id, ...props }: FollowSpaceButtonProps) => {
  const { address = '' } = useSelectKeypair() ?? {}
  const follows = useSelectSpaceIdsByFollower(address)
  const reloadFollows = useCreateReloadSpaceIdsByFollower()
  
  return (
    <FollowButton
      {...props}
      targetId={id}
      follows={follows}
      reloadFollows={(address) => reloadFollows?.(address)}
      followTx="spaceFollows.followSpace"
      unfollowTx="spaceFollows.unfollowSpace"
    />
  )
})
