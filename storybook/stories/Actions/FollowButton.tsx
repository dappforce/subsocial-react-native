//////////////////////////////////////////////////////////////////////
// General purpose FollowButton encompassing following & follow-state
// logic.
// TODO: Following requires SUB -> requires transactions -> requires wallet
// TODO: When following, switch mode to "outline"
import React, { useCallback } from 'react'
import { Icon } from 'react-native-elements'
import { useInit } from '~comps/hooks'
import { useCreateReloadAccountIdsByFollower, useSelectAccountIdsByFollower, useSelectKeypair } from 'src/rtk/app/hooks'
import { useSubstrate } from '~comps/SubstrateContext'
import { AccountId } from 'src/types/subsocial'
import { Button, ButtonProps } from '~comps/Typography'
import { LoginPrompt } from './LoginPrompt'
import { send as sendTx } from 'src/tx'
import { assertDefinedSoft } from 'src/util'
import { logger as createLogger } from '@polkadot/util'

const log = createLogger('FollowButton')

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

export type FollowButtonProps = Omit<ButtonProps, 'children' | 'onPress' | 'icon'> & {
  isFollowing: boolean
  onPress?: (e: FollowEvent) => void
  onFollow?: (e: FollowEvent) => void
  onUnfollow?: (e: FollowEvent) => void
  showIcon?: boolean
}
export function FollowButton({
  isFollowing,
  onPress: _onPress,
  onFollow,
  onUnfollow,
  showIcon = false,
  labelStyle,
  ...props
}: FollowButtonProps)
{
  const onPress = useCallback(() => {
    const evt = new FollowEvent(!isFollowing)
    _onPress?.(evt)
    
    if (!evt.isDefaultPrevented) {
      if (isFollowing) {
        onUnfollow?.(evt)
      }
      else {
        onFollow?.(evt)
      }
    }
  }, [ isFollowing ])
  
  const extraProps: Partial<ButtonProps> = {
    ...props,
    onPress,
  }
  
  // need this branch because the mere presence of the "icon" prop already alters appearance
  if (showIcon) {
    extraProps.icon = ({ size, color }) => <Icon name="people-circle-outline" type="ionicon" {...{ size, color }} />
  }
  
  return (
    <Button
      {...extraProps}
      mode={isFollowing ? 'outlined' : 'contained'}
      labelStyle={[
        { fontSize: 15 },
        showIcon && { marginLeft: 8 },
        labelStyle
      ]}
    >
      {isFollowing ? "Unfollow" : "Follow"}
    </Button>
  )
}

export type FollowAccountButtonProps = Omit<FollowButtonProps, 'isFollowing' | 'loading'> & {
  id: AccountId
}
export const FollowAccountButton = React.memo(({ id, ...props }: FollowAccountButtonProps) => {
  const { api } = useSubstrate() ?? {}
  const { address } = useSelectKeypair() ?? {}
  const followers = useSelectAccountIdsByFollower(address ?? '')
  const reloadFollowers = useCreateReloadAccountIdsByFollower()
  const isFollowing = !!address && followers.includes(id)
  const [ showLoginPrompt, setShowLoginPrompt] = React.useState(false)
  const [ isLoading, setIsLoading ] = React.useState(false)
  
  const initialized = useInit(async () => {
    if (followers || !address) return true
    
    if (!api || !reloadFollowers) return false
    
    await reloadFollowers(address)
    return true
  }, [ id ], [ reloadFollowers ])
  
  const onPress = useCallback(async (e: FollowEvent) => {
    console.log(address)
    if (!address) {
      e.preventDefault()
      setShowLoginPrompt(true)
    }
    
    else {
      if (!assertDefinedSoft(api, { symbol: 'api', tag: 'FollowAccountButton/onFollow/api' }) ||
          !assertDefinedSoft(reloadFollowers, { symbol: 'reloadFollowers', tag: 'FollowAccountButton/onFollow/reloadFollowers' }))
      {
        e.preventDefault()
        return
      }
      
      setIsLoading(true)
      
      try {
        await sendTx({
          api,
          tx: e.isFollowing
            ? 'profileFollows.followAccount'
            : 'profileFollows.unfollowAccount',
          args: [ id ],
        })
        await reloadFollowers(address)
      }
      
      finally {
        setIsLoading(false)
      }
    }
  }, [ address, setIsLoading ])
  
  return (
    <>
      <FollowButton
        {...props}
        {...{
          isFollowing,
          onPress,
        }}
        loading={!initialized || isLoading}
      />
      <LoginPrompt visible={showLoginPrompt} onClose={() => setShowLoginPrompt(false)} />
    </>
  )
})
