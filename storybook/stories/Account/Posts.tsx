import React, { useCallback, useEffect } from 'react'
import { StyleSheet } from 'react-native'
import { useCreateReloadPosts, useCreateReloadProfilePosts, useSelectProfilePosts } from 'src/rtk/app/hooks'
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
  
  const loader = async (ids: PostId[]) => {
    if (reloadPosts) {
      // await reloadPosts({ ids })
    }
    else {
      console.error('reloadPosts should be defined')
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
  id: AccountId
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
