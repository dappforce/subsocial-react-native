//////////////////////////////////////////////////////////////////////
// Underlying User Components
import React, { useCallback } from 'react'
import { useSelectKeypair } from 'src/rtk/app/hooks'
import { AccountId } from 'src/types/subsocial'
import { ActionMenu, FollowAccountButton } from '~stories/Actions'
import { Header } from '~stories/Misc'

export type HeadProps = {
  id: AccountId
  name: string
  avatar?: string
  numFollowers: number
  numFollowing: number
  showFollowButton?: boolean
}
export function Head({ id, name, avatar, numFollowers, numFollowing, showFollowButton }: HeadProps) {
  const { address: myAddress } = useSelectKeypair() ?? {}
  const isMyAccount = myAddress === id
  
  const renderPrimary = useCallback(() => (
    <ActionMenu.Primary>
      <FollowAccountButton id={id} />
    </ActionMenu.Primary>
  ), [ id ])
  
  return (
    <Header
      title={name}
      subtitle={`${numFollowers} Followers · ${numFollowing} Following`}
      avatar={avatar}
      actionMenuProps={{
        primary: !isMyAccount && showFollowButton ? renderPrimary : undefined
      }}
    />
  )
}
