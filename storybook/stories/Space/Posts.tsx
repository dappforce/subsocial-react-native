//////////////////////////////////////////////////////////////////////
// All the details of a space
import React, { useCallback, useMemo } from 'react'
import { StyleSheet } from 'react-native'
import { AccountId, PostId, SpaceId } from 'src/types/subsocial'
import { useCreateReloadPosts, useRefreshSpacePosts, useResolvedSpaceHandle, useSelectPost } from 'src/rtk/app/hooks'
import { RefreshPayload } from 'src/rtk/features/spacePosts/spacePostsSlice'
import { DynamicExpansionList, DynamicExpansionListProps } from '../Misc/InfiniteScroll'
import { Preview } from './Preview'
import * as Post from '../Post'
import { Divider } from 'src/components/Typography'
import { descending } from 'src/util'

export type PostsProps = {
  id: SpaceId
  onPressMore?: (postId: PostId) => void
  onPressOwner?: (postId: PostId, ownerId: AccountId) => void
}
export function Posts({id: spaceid, onPressMore, onPressOwner}: PostsProps) {
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
      <WrappedPost id={id} {...{onPressMore, onPressOwner}} />
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

type WrappedPostProps = Omit<Post.PostPreviewProps, 'onPressMore' | 'onPressSpace' | 'onPressOwner'> & {
  onPressMore?: (id: PostId) => void
  onPressOwner?: (id: PostId, ownerId: AccountId) => void
}
function WrappedPost({id, onPressMore: _onPressMore, onPressOwner: _onPressOwner}: WrappedPostProps) {
  const data = useSelectPost(id)
  const ownerId = data?.post?.struct?.ownerId
  
  const onPressMore  = useCallback(() => _onPressMore?.(id), [ id, _onPressMore ])
  const onPressOwner = useMemo(() => {
    if (!ownerId) return undefined
    return () => _onPressOwner?.(id, ownerId)
  }, [ ownerId, _onPressOwner ])
  
  return (
    <Post.Preview id={id}
      {...{onPressMore, onPressOwner}}
      onPressSpace={()=>{}}
    />
  )
}

const styles = StyleSheet.create({
  padded: {
    padding: 10,
  },
});
