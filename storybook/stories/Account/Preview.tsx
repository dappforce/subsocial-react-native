import React, { useEffect } from 'react'
import { useCreateReloadProfile, useSelectProfile } from 'src/rtk/app/hooks'
import { AccountId } from 'src/types/subsocial'
import { Head } from './Account'

export type PreviewProps = {
  id: AccountId
}
export function Preview({ id }: PreviewProps) {
  const data = useSelectProfile(id)
  const reloadProfile = useCreateReloadProfile()
  
  useEffect(() => {
    if (!data) reloadProfile?.({ id })
  }, [ id, reloadProfile ])
  
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
