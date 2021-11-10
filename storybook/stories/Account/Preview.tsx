import React from 'react'
import { useCreateReloadProfile, useSelectProfile } from 'src/rtk/app/hooks'
import { AccountId } from 'src/types/subsocial'
import { useInit } from '~comps/hooks'
import { Head } from './Account'

export type PreviewProps = {
  id: AccountId
}
export function Preview({ id }: PreviewProps) {
  const data = useSelectProfile(id)
  const reloadProfile = useCreateReloadProfile()
  
  useInit(async () => {
    if (data) return true
    
    if (!reloadProfile) return false
    
    reloadProfile({ id })
    return true
  }, [ id ], [ reloadProfile ])
  
  return (
    <>
      <Head
        id={id}
        name={data?.content?.name ?? id.toString()}
        isFollowing={false} // TODO: following logic... :')
        numFollowers={data?.struct?.followersCount ?? 0}
        numFollowing={data?.struct?.followingAccountsCount ?? 0}
      />
    </>
  )
}
