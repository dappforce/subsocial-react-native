import React, { useCallback, useState } from 'react'
import { StyleSheet } from 'react-native'
import { useStore } from 'react-redux'
import { useSubsocial } from '~comps/SubsocialContext'
import { AccountId } from 'src/types/subsocial'
import { RootState } from 'src/rtk/app/rootReducer'
import { useAppDispatch } from 'src/rtk/app/hooksCommon'
import { fetchEntityOfAccountIdsByFollower, selectAccountIdsByFollower } from 'src/rtk/features/profiles/followedAccountIdsSlice'
import { fetchProfiles } from 'src/rtk/features/profiles/profilesSlice'
import { createThemedStylesHook } from '~comps/Theming'
import { InfiniteScrollList, InfiniteScrollListProps } from '~stories/Misc'
import { Preview } from './Preview'
import { Text } from '~comps/Typography'

type ListPropsSpec = InfiniteScrollListProps<AccountId>

export type FollowsProps = {
  id: AccountId
  onScroll?: ListPropsSpec['onScroll']
  onScrollBeginDrag?: ListPropsSpec['onScrollBeginDrag']
  onScrollEndDrag?: ListPropsSpec['onScrollEndDrag']
}
export function Follows({ id, onScroll, onScrollBeginDrag, onScrollEndDrag }: FollowsProps) {
  const { api } = useSubsocial()
  const dispatch = useAppDispatch()
  const store = useStore<RootState>()
  const [ ids, setIds ] = useState<AccountId[]>([])
  const styles = useThemedStyles()
  
  const loadInitial = useCallback<ListPropsSpec['loadInitial']>(async (pageSize) => {
    await dispatch(fetchEntityOfAccountIdsByFollower({ api, id, reload: true }))
    
    const ids = selectAccountIdsByFollower(store.getState(), id) ?? []
    setIds(ids)
    
    return [ids.slice(0, pageSize), 1]
  }, [ api, dispatch, store, id, setIds ])
  
  const loadMore = useCallback<ListPropsSpec['loadMore']>(async (page, pageSize) => {
    if (page > Math.floor(ids.length / pageSize)) return false
    
    return ids.slice(page * pageSize, (page + 1) * pageSize)
  }, [ ids ])
  
  const loadItems = useCallback<ListPropsSpec['loadItems']>(async (ids: AccountId[]) => {
    await dispatch(fetchProfiles({ api, ids }))
  }, [ api, dispatch, ids ])
  
  const renderItem = useCallback((id: AccountId) => <WrappedFollowedAccount id={id} />, [ id ])
  
  return (
    <InfiniteScrollList
      loadInitial={loadInitial}
      loadMore={loadMore}
      loadItems={loadItems}
      renderItem={renderItem}
      EmptyComponent={<Text mode="secondary" style={styles.empty}>No followed accounts</Text>}
      onScroll={onScroll}
      onScrollBeginDrag={onScrollBeginDrag}
      onScrollEndDrag={onScrollEndDrag}
    />
  )
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

const useThemedStyles = createThemedStylesHook(({ consts }) => StyleSheet.create({
  followedAccount: {
    padding: 2 * consts.spacing,
  },
  empty: {
    textAlign: 'center',
    marginVertical: 10,
  },
}))
