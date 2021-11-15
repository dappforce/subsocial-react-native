import React, { useCallback } from 'react'
import { StyleSheet } from 'react-native'
import { useStore } from 'react-redux'
import { AccountId } from 'src/types/subsocial'
import { useCreateReloadAccountIdsByFollower, useCreateReloadProfile, useSelectProfile } from 'src/rtk/app/hooks'
import { selectAccountIdsByFollower } from 'src/rtk/features/profiles/followedAccountIdsSlice'
import { RootState } from 'src/rtk/app/rootReducer'
import { Preview } from './Preview'
import { createThemedStylesHook } from '~comps/Theming'
import { DynamicExpansionList } from '~stories/Misc'
import { SpanningActivityIndicator } from '~comps/SpanningActivityIndicator'
import { assertDefinedSoft } from 'src/util'

export type FollowsProps = {
  id: AccountId
}
export function Follows({ id }: FollowsProps) {
  const reload = useCreateReloadAccountIdsByFollower()
  const reloadProfile = useCreateReloadProfile()
  const store = useStore<RootState>()
  
  const ids = useCallback(async () => {
    if (!assertDefinedSoft(reload, { symbol: 'reload', tag: 'Account/Follows/ids' })) return []
    
    await reload(id)
    return selectAccountIdsByFollower(store.getState(), id) ?? []
  }, [ id ])
  
  const loader = async (ids: AccountId[]) => {
    if (assertDefinedSoft(reloadProfile, { symbol: 'reloadProfile', tag: 'Account/Follows/loader' })) {
      await Promise.all(ids.map(id => reloadProfile({ id })))
    }
    return ids
  }
  
  const renderItem = (id: AccountId) => {
    return <WrappedFollowedAccount id={id} />
  }
  
  const isReady = !!reload && !!reloadProfile
  
  if (!isReady) {
    return <SpanningActivityIndicator />
  }
  
  else {
    return (
      <DynamicExpansionList
        {...{
          ids,
          loader,
          renderItem
        }}
      />
    )
  }
}

type WrappedFollowedAccountProps = {
  id: AccountId
}
const WrappedFollowedAccount = React.memo(({ id }: WrappedFollowedAccountProps) => {
  const styles = useThemedStyles()
  
  return (
    <Preview
      id={id}
      containerStyle={styles.followedAccount}
    />
  )
})

const useThemedStyles = createThemedStylesHook(({ colors }) => StyleSheet.create({
  followedAccount: {
    padding: 20,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderColor: colors.divider,
  },
}))
