import React, { useCallback } from 'react'
import { StyleSheet } from 'react-native'
import { useCreateReloadPosts } from 'src/rtk/app/hooks'
import { AccountId, PostId, SpaceId } from 'src/types/subsocial'
import { assertDefinedSoft } from 'src/util'
import { SpanningActivityIndicator } from '~comps/SpanningActivityIndicator'
import { createThemedStylesHook } from '~comps/Theming'
import { Text } from '~comps/Typography'
import { InfiniteScrollList, InfiniteScrollListProps } from '~stories/Misc'
import * as Post from '../Post'
import config from 'config.json'
import axios from 'axios'

type RESTResponse = {
  account: AccountId
  block_number: number
  post_id: PostId
  space_id: SpaceId
}
["account", "block_number", "event_index", "event", "following_id", "space_id", "post_id", "comment_id", "parent_comment_id", "date", "aggregated", "agg_count"]

export type PostsProps = {
  id: AccountId
  onScroll?: InfiniteScrollListProps<PostId>['onScroll']
  onScrollBeginDrag?: InfiniteScrollListProps<PostId>['onScrollBeginDrag']
  onScrollEndDrag?: InfiniteScrollListProps<PostId>['onScrollEndDrag']
}
export function Posts({ id, onScroll, onScrollBeginDrag, onScrollEndDrag }: PostsProps) {
  const reloadPosts = useCreateReloadPosts()
  
  // fetch post IDs from offchain REST API because it's magnitudes faster
  const url = `${config.connections.rpc.offchain}/v1/offchain/activities/${id}/posts`
  
  const ids = useCallback(async () => {
    const res = await axios.get<RESTResponse[]>(url)
    if (res.status !== 200) return []
    
    return res.data.map(({ post_id }) => post_id)
  }, [ url ])
  
  const loader = async (ids: PostId[]) => {
    if (assertDefinedSoft(reloadPosts, { symbol: 'reloadPosts', tag: 'Account/Posts/loader' })) {
      await reloadPosts({ ids, reload: true })
    }
    return ids
  }
  
  const renderPost = useCallback((id: PostId) => <WrappedPost id={id} />, [])
  
  const isReady = !!reloadPosts
  
  if (!isReady) {
    return (
      <SpanningActivityIndicator />
    )
  }
  
  else {
    return (
      <InfiniteScrollList
        ids={ids}
        loader={loader}
        renderItem={renderPost}
        renderEmpty={() => <Text>No posts</Text>}
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
