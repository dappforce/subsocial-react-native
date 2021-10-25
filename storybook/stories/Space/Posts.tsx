//////////////////////////////////////////////////////////////////////
// All the details of a space
import React, { useCallback } from 'react'
import { StyleSheet } from 'react-native'
import { PostId, SpaceId } from 'src/types/subsocial'
import { useCreateReloadPosts, useRefreshSpacePosts, useResolvedSpaceHandle } from 'src/rtk/app/hooks'
import { RefreshPayload } from 'src/rtk/features/spacePosts/spacePostsSlice'
import { DynamicExpansionList, DynamicExpansionListProps } from '../Misc/InfiniteScroll'
import { Preview } from './Preview'
import * as Post from '../Post'
import { Divider } from 'src/components/Typography'
import { descending } from 'src/util'

export type PostsProps = {
  id: SpaceId
}
export function Posts({id: spaceid}: PostsProps) {
  type ListSpec = DynamicExpansionListProps<PostId>
  
  const resolvedId = useResolvedSpaceHandle(spaceid)
  const reloadPosts = useCreateReloadPosts()
  const refreshPosts = useRefreshSpacePosts()
  
  const loadIds = useCallback(async () => {
    const res = await (refreshPosts?.({id: resolvedId}))
    const raw = (res?.payload as RefreshPayload)?.posts ?? []
    return [...raw].sort(descending)
  }, [refreshPosts, resolvedId])
  
  const loader: ListSpec['loader'] = async (ids) => {
    reloadPosts?.({ids})
  }
  
  const renderSpace: ListSpec['renderHeader'] = () => {
    return <>
      <Preview id={spaceid} showTags showSocials showAbout showFollowButton containerStyle={styles.padded} />
      <Divider />
    </>
  }
  
  const renderItem: ListSpec['renderItem'] = (id) => {
    return <>
      <Post.Preview id={id} />
      <Divider />
    </>
  }
  
  return (
    <DynamicExpansionList
      ids={loadIds}
      loader={loader}
      renderHeader={renderSpace}
      renderItem={renderItem}
    />
  )
}

const styles = StyleSheet.create({
  padded: {
    padding: 10,
  },
});
