import React, { useCallback, useState } from 'react'
import { StyleSheet } from 'react-native'
import { useStore } from 'react-redux'
import { AccountId, SpaceId } from 'src/types/subsocial'
import { useSubsocial } from '~comps/SubsocialContext'
import { useAppDispatch } from 'src/rtk/app/hooksCommon'
import { RootState } from 'src/rtk/app/rootReducer'
import { fetchEntityOfSpaceIdsByFollower, selectSpaceIdsByFollower } from 'src/rtk/features/spaceIds/followedSpaceIdsSlice'
import { fetchSpaces } from 'src/rtk/features/spaces/spacesSlice'
import { createThemedStylesHook } from '~comps/Theming'
import * as Space from '~stories/Space'
import { InfiniteScrollList, InfiniteScrollListProps } from '~stories/Misc'
import { Text } from '~comps/Typography'

type ListPropsSpec = InfiniteScrollListProps<SpaceId>

export type SpacesProps = {
  id: AccountId
  onScroll?: ListPropsSpec['onScroll']
  onScrollBeginDrag?: ListPropsSpec['onScrollBeginDrag']
  onScrollEndDrag?: ListPropsSpec['onScrollEndDrag']
}
export function Spaces({ id, onScroll, onScrollBeginDrag, onScrollEndDrag }: SpacesProps) {
  const { api } = useSubsocial()
  const dispatch = useAppDispatch()
  const store = useStore<RootState>()
  const [ ids, setIds ] = useState<SpaceId[]>([])
  const styles = useThemedStyles()
  
  const loadInitial = useCallback<ListPropsSpec['loadInitial']>(async (pageSize) => {
    await dispatch(fetchEntityOfSpaceIdsByFollower({ api, id, reload: true }))
    const ids = selectSpaceIdsByFollower(store.getState(), id) ?? []
    
    setIds(ids)
    return [ids.slice(0, pageSize), 1]
  }, [ api, store, id ])
  
  const loadMore = useCallback<ListPropsSpec['loadMore']>(async (page, pageSize) => {
    if (page > Math.floor(ids.length / pageSize)) return false
    
    return ids.slice(page * pageSize, (page + 1) * pageSize)
  }, [ id, ids ])
  
  const loadItems = useCallback<ListPropsSpec['loadItems']>(async (ids) => {
    await dispatch(fetchSpaces({ api, ids, reload: true }))
  }, [ api, dispatch ])
  
  return (
    <InfiniteScrollList
      loadInitial={loadInitial}
      loadMore={loadMore}
      loadItems={loadItems}
      EmptyComponent={<Text mode="secondary" style={styles.empty}>No followed spaces</Text>}
      renderItem={(id) => <WrappedSpace id={id} />}
      onScroll={onScroll}
      onScrollBeginDrag={onScrollBeginDrag}
      onScrollEndDrag={onScrollEndDrag}
    />
  )
}

type WrappedSpaceProps = {
  id: SpaceId
}
const WrappedSpace = React.memo(({ id }: WrappedSpaceProps) => {
  const styles = useThemedStyles()
  
  return (
    <Space.Preview id={id} containerStyle={styles.space} />
  )
})

const useThemedStyles = createThemedStylesHook(({ colors }) => StyleSheet.create({
  space: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderColor: colors.divider,
    padding: 20,
  },
  empty: {
    fontStyle: 'italic',
    textAlign: 'center',
  },
}))
