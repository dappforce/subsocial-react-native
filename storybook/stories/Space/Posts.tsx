//////////////////////////////////////////////////////////////////////
// All the details of a space
import React, { useCallback } from 'react'
import { StyleSheet } from 'react-native'
import { AccountId, PostId, SpaceId } from 'src/types/subsocial'
import { useCreateReloadPosts, useCreateReloadSpace, useFetchSpacePosts, useResolvedSpaceHandle } from 'src/rtk/app/hooks'
import { RefreshPayload } from 'src/rtk/features/spacePosts/spacePostsSlice'
import { InfiniteScrollList, InfiniteScrollListProps } from '../Misc/InfiniteScroll'
import { createThemedStylesHook, useTheme } from '~comps/Theming'
import { Data } from './Data'
import * as Post from '../Post'
import { assertDefinedSoft, descending } from 'src/util'
import { SpanningActivityIndicator } from '~comps/SpanningActivityIndicator'

export type PostsProps = {
  id: SpaceId
  onPressMore?: (postId: PostId) => void
  onPressOwner?: (postId: PostId, ownerId: AccountId) => void
}
export function Posts({ id: spaceId, onPressMore, onPressOwner }: PostsProps) {
  type ListSpec = InfiniteScrollListProps<PostId>
  
  const resolvedId = useResolvedSpaceHandle(spaceId)
  const reloadSpace = useCreateReloadSpace()
  const reloadPosts = useCreateReloadPosts()
  const refreshPosts = useFetchSpacePosts()
  const styles = useThemedStyles()
  const isReady = !!(resolvedId && reloadSpace && reloadPosts && refreshPosts)
  
  const loadIds = useCallback(async () => {
    const res = await (refreshPosts?.({ id: resolvedId }))
    const raw = (res?.payload as RefreshPayload)?.posts ?? []
    return [ ...raw ].sort(descending)
  }, [refreshPosts, resolvedId])
  
  const loader: ListSpec['loader'] = async (ids) => {
    if (assertDefinedSoft(reloadPosts, { symbol: 'reloadPosts', tag: 'Space/Posts/loader' })) {
      await reloadPosts({ ids })
    }
    return ids
  }
  
  const loadInitial: ListSpec['loadInitial'] = async () => {
    await reloadSpace!({ id: spaceId })
  }
  
  const renderSpace: ListSpec['renderHeader'] = () => {
    return (
      <Data
        id={spaceId}
        showTags
        showSocials
        showAbout
        showFollowButton
        containerStyle={styles.space}
      />
    )
  }
  
  const renderItem: ListSpec['renderItem'] = (id) => <WrappedPost {...{ id, onPressMore, onPressOwner }} />
  
  if (!isReady) {
    return <SpanningActivityIndicator />
  }
  
  else {
    return (
      <InfiniteScrollList
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
const WrappedPost = React.memo(({ id, onPressMore, onPressOwner }: WrappedPostProps) => {
  const theme = useTheme()
  
  return (
    <>
      <Post.Preview id={id} containerStyle={{ borderBottomColor: theme.colors.divider }}
        {...{ onPressMore, onPressOwner }}
        onPressSpace={()=>{}}
      />
    </>
  )
})

const useThemedStyles = createThemedStylesHook(({ colors }) => StyleSheet.create({
  space: {
    padding: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderColor: colors.divider,
  },
}))
