//////////////////////////////////////////////////////////////////////
// Underlying User Components
import React, { useCallback } from 'react'
import { AccountId } from 'src/types/subsocial'
import { ActionMenu, FollowAccountButton } from '~stories/Actions'
import { Header } from '~stories/Misc'

export type HeadProps = {
  id: AccountId
  name: string
  avatar?: string
  numFollowers: number
  numFollowing: number
}
export function Head({ id, name, avatar, numFollowers, numFollowing }: HeadProps) {
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
        primary: renderPrimary
      }}
    />
  )
}
