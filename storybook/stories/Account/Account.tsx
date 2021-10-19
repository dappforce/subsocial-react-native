//////////////////////////////////////////////////////////////////////
// Underlying User Components
import React, { useCallback } from 'react'
import { useSubsocialEffect } from '~comps/SubsocialContext'
import { ActionMenu, FollowButton } from '~stories/Actions'
import { SubsocialApi } from '@subsocial/api'
import { AnyAccountId } from '@subsocial/types/substrate'
import { Header } from '~stories/Misc'

export type UnifiedAccountID = number | AnyAccountId

export class AccountNotFoundError extends Error {
  public readonly accountID;
  
  constructor(id: UnifiedAccountID) {
    super(`account ${id} not found`);
    this.accountID = id;
  }
}

export type HeadProps = {
  id: UnifiedAccountID
  name: string
  avatar?: string
  numFollowers: number
  numFollowing: number
  isFollowing: boolean
}
export function Head({id, name, avatar, numFollowers, numFollowing, isFollowing}: HeadProps) {
  const renderPrimary = useCallback(() => (
    <>
      <ActionMenu.Primary>
        <FollowButton
          {...{id, isFollowing}}
          onPress={() => alert('not yet implemented, sorry')}
          hideIcon
        />
      </ActionMenu.Primary>
    </>
  ), [id, isFollowing]);
  
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

export const useAccount = (id: AnyAccountId) => useSubsocialEffect(async api => {
  if (!id) return undefined;
  const data  = await api.findProfile(id);
  if (!data) throw new AccountNotFoundError(id);
  return data;
}, [id]);

export async function resolveAccountId(id: UnifiedAccountID, api: SubsocialApi): Promise<AnyAccountId> {
  if (typeof id === 'string' && id.startsWith('@')) {
    throw new Error('handles currently not supported, please use addresses instead')
  }
  else {
    return id as string;
  }
}
