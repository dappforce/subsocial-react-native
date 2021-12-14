//////////////////////////////////////////////////////////////////////
// All the details of a space
import React, { useCallback, useState } from 'react'
import { StyleSheet } from 'react-native'
import { useStore } from 'react-redux'
import { useSubsocial } from '~comps/SubsocialContext'
import { AccountId, PostId, SpaceId } from 'src/types/subsocial'
import { RootState } from 'src/rtk/app/rootReducer'
import { useResolvedSpaceHandle } from 'src/rtk/app/hooks'
import { useAppDispatch } from 'src/rtk/app/hooksCommon'
import { fetchPosts } from 'src/rtk/features/posts/postsSlice'
import { fetchSpacePosts, selectSpacePosts } from 'src/rtk/features/spacePosts/spacePostsSlice'
import { createThemedStylesHook, useTheme } from '~comps/Theming'
import { InfiniteScrollList, InfiniteScrollListProps } from '../Misc/InfiniteScroll'
import { SpanningActivityIndicator } from '~comps/SpanningActivityIndicator'
import { Data } from './Data'
import * as Post from '../Post'
import { descending } from 'src/util/algo'

type ListSpec = InfiniteScrollListProps<PostId>

export type PostsProps = {
  id: SpaceId
  onPressMore?: (postId: PostId) => void
  onPressOwner?: (postId: PostId, ownerId: AccountId) => void
}
export function Posts({ id: spaceId, onPressMore, onPressOwner }: PostsProps) {
  const { api } = useSubsocial()
  const dispatch = useAppDispatch()
  const store = useStore<RootState>()
  const {id: resolvedId, loading: loadingId} = useResolvedSpaceHandle(spaceId)
  const styles = useThemedStyles()
  const [ ids, setIds ] = useState<PostId[]>([])
  
  const loadInitial = useCallback<ListSpec['loadInitial']>(async (pageSize) => {
    await dispatch(fetchSpacePosts({ api, id: resolvedId }))
    const ids = selectSpacePosts(store.getState(), resolvedId) ?? []
    
    setIds([...new Set(ids)].sort(descending))
    return [ids.slice(0, pageSize), 1]
  }, [ resolvedId ])
  
  const loadMore = useCallback<ListSpec['loadMore']>(async (page, pageSize) => {
    return ids.slice(page * pageSize, (page + 1) * pageSize)
  }, [ ids ])
  
  const loadItems = useCallback<ListSpec['loadItems']>(async (ids) => {
    await dispatch(fetchPosts({ api, ids }))
  }, [ api, dispatch ])
  
  const renderItem: ListSpec['renderItem'] = (id) => <WrappedPost {...{ id, onPressMore, onPressOwner }} />
  
  if (loadingId) {
    return <SpanningActivityIndicator />
  }
  
  else {
    return (
      <InfiniteScrollList
        loadInitial={loadInitial}
        loadMore={loadMore}
        loadItems={loadItems}
        HeaderComponent={<Data
          id={spaceId}
          showTags
          showSocials
          showAbout
          showFollowButton
          containerStyle={styles.space}
        />}
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
