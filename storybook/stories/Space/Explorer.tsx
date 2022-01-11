//////////////////////////////////////////////////////////////////////
// Space Explorer - a whole bunch of summaries
import React, { useCallback } from 'react'
import { StyleSheet } from 'react-native'
import { Preview } from './Preview'
import { InfiniteScrollList, InfiniteScrollListProps } from '~stories/Misc/InfiniteScroll'
import { SpaceId } from 'src/types/subsocial'
import { useCreateReloadSpace } from 'src/rtk/app/hooks'
import { createThemedStylesHook } from '~comps/Theming'

export type SuggestedProps = {
  spaces: SpaceId[]
}
export function Suggested({ spaces }: SuggestedProps) {
  type ListSpec = InfiniteScrollListProps<SpaceId>
  
  const reloadSpace = useCreateReloadSpace()
  const renderItem = (id: SpaceId) => <WrappedSpace id={id} />
  
  const loadInitial = useCallback<ListSpec['loadInitial']>((pageSize) => [spaces.slice(0, pageSize), 1], [ spaces ])
  
  const loadMore = useCallback<ListSpec['loadMore']>((page, pageSize) => {
    if (page >= Math.floor(spaces.length / pageSize) + 1) return false
    
    return spaces.slice(page * pageSize, (page + 1) * pageSize)
  }, [ spaces ])
  
  const loadItems = useCallback(async (ids: SpaceId[]) => {
    await Promise.all(ids.map(id => reloadSpace({ id })))
  }, [ reloadSpace ])
  
  return (
    <InfiniteScrollList<SpaceId>
      loadInitial={loadInitial}
      loadMore={loadMore}
      loadItems={loadItems}
      renderItem={renderItem}
      refreshable={false}
    />
  )
}

type WrappedSpaceProps = {
  id: SpaceId
}
const WrappedSpace = React.memo(({ id }: WrappedSpaceProps) => {
  const styles = useThemedStyles()
  
  return (
    <Preview
      id={id}
      showAbout
      showFollowButton
      showTags
      containerStyle={styles.wrappedSpace}
    />
  )
})

const useThemedStyles = createThemedStylesHook(({ consts }) => StyleSheet.create({
  wrappedSpace: {
    padding: 2 * consts.spacing,
  },
}))
