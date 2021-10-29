//////////////////////////////////////////////////////////////////////
// All the details of a space
import React, { useCallback, useMemo } from 'react'
import { StyleSheet } from 'react-native'
import { AccountId, PostId, SpaceId } from 'src/types/subsocial'
import { useCreateReloadPosts, useCreateReloadSpace, useRefreshSpacePosts, useResolvedSpaceHandle, useSelectPost } from 'src/rtk/app/hooks'
import { RefreshPayload } from 'src/rtk/features/spacePosts/spacePostsSlice'
import { DynamicExpansionList, DynamicExpansionListProps } from '../Misc/InfiniteScroll'
import { Preview } from './Preview'
import * as Post from '../Post'
import { Divider } from 'src/components/Typography'
import { descending } from 'src/util'
import { SpanningActivityIndicator } from '~comps/SpanningActivityIndicator'

export type PostsProps = {
  id: SpaceId
  onPressMore?: (postId: PostId) => void
  onPressOwner?: (postId: PostId, ownerId: AccountId) => void
}
export function Posts({id: spaceId, onPressMore, onPressOwner}: PostsProps) {
  type ListSpec = DynamicExpansionListProps<PostId>
  
  const resolvedId = useResolvedSpaceHandle(spaceId)
  const reloadSpace = useCreateReloadSpace()
  const reloadPosts = useCreateReloadPosts()
  const refreshPosts = useRefreshSpacePosts()
  const isReady = useMemo(() => !!(resolvedId && reloadSpace && reloadPosts && refreshPosts), [ resolvedId, reloadSpace, reloadPosts, refreshPosts ])
  
  const loadIds = useCallback(async () => {
    const res = await (refreshPosts?.({id: resolvedId}))
    const raw = (res?.payload as RefreshPayload)?.posts ?? []
    return [...raw].sort(descending)
  }, [refreshPosts, resolvedId])
  
  const loader: ListSpec['loader'] = async (ids) => {
    await reloadPosts!({ids})
  }
  
  const loadInitial: ListSpec['loadInitial'] = async () => {
    await reloadSpace!({ id: spaceId })
  }
  
  const renderSpace: ListSpec['renderHeader'] = () => {
    return <>
      <Preview id={spaceId} showTags showSocials showAbout showFollowButton containerStyle={styles.padded} />
      <Divider />
    </>
  }
  
  const renderItem: ListSpec['renderItem'] = (id) => <WrappedPost {...{id, onPressMore, onPressOwner}} />
  
  if (!isReady) {
    return <SpanningActivityIndicator />
  }
  else {
    return (
      <DynamicExpansionList
        ids={loadIds}
        loader={loader}
        loadInitial={loadInitial}
        renderHeader={renderSpace}
        renderItem={renderItem}
      />
    )
  }
}

type WrappedPostProps = Omit<Post.PostPreviewProps, 'onPressMore' | 'onPressSpace' | 'onPressOwner'> & {
  onPressMore?: (id: PostId) => void
  onPressOwner?: (id: PostId, ownerId: AccountId) => void
}
const WrappedPost = React.memo(({id, onPressMore, onPressOwner}: WrappedPostProps) => {
  return (
    <>
      <Post.Preview id={id}
        {...{onPressMore, onPressOwner}}
        onPressSpace={()=>{}}
      />
      <Divider />
    </>
  )
})

const styles = StyleSheet.create({
  padded: {
    padding: 10,
  },
});
