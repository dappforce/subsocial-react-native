import React, { useCallback } from 'react'
import { StyleSheet } from 'react-native'
import { useStore } from 'react-redux'
import { useCreateReloadPosts, useCreateReloadProfilePosts, useSelectProfilePosts } from 'src/rtk/app/hooks'
import { RootState } from 'src/rtk/app/rootReducer'
import { AccountId, PostId } from 'src/types/subsocial'
import { assertDefinedSoft } from 'src/util'
import { useInit } from '~comps/hooks'
import { SpanningActivityIndicator } from '~comps/SpanningActivityIndicator'
import { createThemedStylesHook } from '~comps/Theming'
import { Text } from '~comps/Typography'
import { DynamicExpansionList, DynamicExpansionListProps } from '~stories/Misc'
import * as Post from '../Post'

export type PostsProps = {
  id: AccountId
  onScroll?: DynamicExpansionListProps<PostId>['onScroll']
  onScrollBeginDrag?: DynamicExpansionListProps<PostId>['onScrollBeginDrag']
  onScrollEndDrag?: DynamicExpansionListProps<PostId>['onScrollEndDrag']
}
export function Posts({ id, onScroll, onScrollBeginDrag, onScrollEndDrag }: PostsProps) {
  const [ loading, postIds ] = useSelectProfilePosts(id)
  const reloadProfilePosts = useCreateReloadProfilePosts()
  const reloadPosts = useCreateReloadPosts()
  const store = useStore<RootState>()
  
  // TODO: refresh posts
  
  const loader = async (ids: PostId[]) => {
    if (assertDefinedSoft(reloadPosts, { symbol: 'reloadPosts', tag: 'Account/Posts/loader' })) {
      await reloadPosts({ ids, reload: true })
      return ids.filter(postId => {
        return store.getState().posts.entities[postId]?.ownerId === id
      })
    }
    else {
      return ids
    }
  }
  
  const renderPost = useCallback((id: PostId) => <WrappedPost id={id} />, [])
  
  const isReady = !!reloadProfilePosts && !!reloadPosts && !loading
  
  useInit(async () => {
    if (!isReady) return false
    
    if (!reloadProfilePosts) return false
    
    if (!postIds.length) {
      await reloadProfilePosts({ id })
    }
    
    return true
  }, [ id ], [ reloadProfilePosts ])
  
  if (!isReady) {
    return (
      <SpanningActivityIndicator />
    )
  }
  
  else if (!postIds.length) {
    return (
      <Text mode="secondary" style={{margin: 20, textAlign: 'center', fontStyle: 'italic'}}>No posts</Text>
    )
  }
  
  else {
    return (
      <DynamicExpansionList
        ids={postIds}
        loader={loader}
        renderItem={renderPost}
        onScroll={onScroll}
        onScrollBeginDrag={onScrollBeginDrag}
        onScrollEndDrag={onScrollEndDrag}
      />
    )
  }
}

type WrappedPostProps = {
  id: PostId
}
const WrappedPost = React.memo(({ id }: WrappedPostProps) => {
  const styles = useThemedStyles()
  return <Post.Preview id={id} containerStyle={styles.post} />
})

const useThemedStyles = createThemedStylesHook(({ colors }) => StyleSheet.create({
  post: {
    padding: 20,
    paddingBottom: 0,
    borderBottomWidth: 1,
    borderColor: colors.line,
  },
}))
