import React, { useCallback } from 'react'
import { StyleSheet } from 'react-native'
import { AccountId, SpaceId } from 'src/types/subsocial'
import {
  useCreateReloadSpace,
  useCreateReloadSpaceIdsRelatedToAccount,
  useSelectSpaceIdsWhereAccountCanPost,
} from 'src/rtk/app/hooks'
import { useInit } from '~comps/hooks'
import { SpanningActivityIndicator } from '~comps/SpanningActivityIndicator'
import * as Space from '~stories/Space'
import { InfiniteScrollList, InfiniteScrollListProps } from '~stories/Misc'
import { Text } from '~comps/Typography'
import { createThemedStylesHook } from '~comps/Theming'
import { assertDefinedSoft } from 'src/util'

export type SpacesProps = {
  id: AccountId
  onScroll?: InfiniteScrollListProps<SpaceId>['onScroll']
  onScrollBeginDrag?: InfiniteScrollListProps<SpaceId>['onScrollBeginDrag']
  onScrollEndDrag?: InfiniteScrollListProps<SpaceId>['onScrollEndDrag']
}
export function Spaces({ id, onScroll, onScrollBeginDrag, onScrollEndDrag }: SpacesProps) {
  const spaces = useSelectSpaceIdsWhereAccountCanPost(id)
  const reloadSpace = useCreateReloadSpace()
  const reloadOwnSpaces = useCreateReloadSpaceIdsRelatedToAccount()
  const styles = useThemedStyles()
  
  const loader = useCallback(async (ids: SpaceId[]) => {
    if (assertDefinedSoft(reloadSpace, { symbol: 'reloadSpace', tag: 'Post/Spaces/loader'})) {
      await Promise.all(ids.map(id => reloadSpace({ id })))
    }
    return ids
  }, [])
  
  const initialized = useInit(async () => {
    if (spaces && spaces.length) return true
    
    if (!reloadOwnSpaces) return false
    
    await reloadOwnSpaces(id)
    return true
  }, [ id ], [ reloadOwnSpaces ])
  
  const isReady = initialized && reloadSpace
  
  if (!isReady) {
    return <SpanningActivityIndicator />
  }
  
  else if (!spaces.length) {
    return (
      <Text mode="secondary" style={styles.noSpaces}>No spaces.</Text>
    )
  }
  
  else {
    return (
      <InfiniteScrollList
        ids={spaces}
        loader={loader}
        renderItem={(id) => <WrappedSpace id={id} />}
        onScroll={onScroll}
        onScrollBeginDrag={onScrollBeginDrag}
        onScrollEndDrag={onScrollEndDrag}
      />
    )
  }
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
  noSpaces: {
    fontStyle: 'italic',
    textAlign: 'center',
  },
}))
