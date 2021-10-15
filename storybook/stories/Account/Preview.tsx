import React from 'react'
import { Head, useAccount } from './Account'
import { AnyAccountId } from '@subsocial/types'

export type PreviewProps = {
  id: AnyAccountId
  preview?: boolean
}
export function Preview({id, preview = false}: PreviewProps) {
  const [_, data] = useAccount(id);
  
  return (
    <>
      <Head
        id={id}
        name={data?.content?.name ?? id.toString()}
        isFollowing={false} // TODO: following logic... :')
        numFollowers={data?.struct?.followers_count?.toNumber?.() ?? 0}
        numFollowing={data?.struct?.following_accounts_count?.toNumber?.() ?? 0}
      />
    </>
  )
}
