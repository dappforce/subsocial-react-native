//////////////////////////////////////////////////////////////////////
// Underlying User Components
import React, { useCallback } from 'react'
import { AccountId } from 'src/types/subsocial'
import { ActionMenu, FollowButton } from '~stories/Actions'
import { Header } from '~stories/Misc'

export type HeadProps = {
  id: AccountId
  name: string
  avatar?: string
  numFollowers: number
  numFollowing: number
  isFollowing: boolean
}
export function Head({ id, name, avatar, numFollowers, numFollowing, isFollowing }: HeadProps) {
  const renderPrimary = useCallback(() => (
    <ActionMenu.Primary>
      <FollowButton
        {...{ id, isFollowing }}
        onPress={() => alert('not yet implemented, sorry')}
      />
    </ActionMenu.Primary>
  ), [ id, isFollowing ])
  
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
