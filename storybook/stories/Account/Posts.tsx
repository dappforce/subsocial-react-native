import React, { useCallback } from 'react'
import { StyleSheet } from 'react-native'
import { useStore } from 'react-redux'
import { useCreateReloadPosts, useCreateReloadProfilePosts, useSelectProfilePosts } from 'src/rtk/app/hooks'
import { RootState } from 'src/rtk/app/rootReducer'
import { AccountId, PostId } from 'src/types/subsocial'
import { useInit } from '~comps/hooks'
import { SpanningActivityIndicator } from '~comps/SpanningActivityIndicator'
import { createThemedStylesHook } from '~comps/Theming'
import { Text } from '~comps/Typography'
import { DynamicExpansionList } from '~stories/Misc'
import * as Post from '../Post'

export type PostsProps = {
  id: AccountId
}
export function Posts({ id }: PostsProps) {
  const [ loading, postIds ] = useSelectProfilePosts(id)
  const reloadProfilePosts = useCreateReloadProfilePosts()
  const reloadPosts = useCreateReloadPosts()
  const store = useStore<RootState>()
  
  const loader = async (ids: PostId[]) => {
    if (reloadPosts) {
      await reloadPosts({ ids })
      return ids.filter(postId => {
        return store.getState().posts.entities[postId]?.ownerId === id
      })
    }
    else {
      console.error('reloadPosts should be defined')
      return ids
    }
  }
  
  const renderPost = useCallback((postId: PostId) => <WrappedPost id={postId} />, [])
  
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
