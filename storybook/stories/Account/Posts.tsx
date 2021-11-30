import React, { useCallback } from 'react'
import { StyleSheet } from 'react-native'
import { AccountId, PostId, SpaceId } from 'src/types/subsocial'
import { createThemedStylesHook } from '~comps/Theming'
import { Text } from '~comps/Typography'
import { InfiniteScrollList, InfiniteScrollListProps } from '~stories/Misc'
import * as Post from '../Post'
import config from 'config.json'
import axios from 'axios'
import { useSubsocial } from '~comps/SubsocialContext'
import { useAppDispatch } from 'src/rtk/app/hooksCommon'
import { fetchPosts } from 'src/rtk/features/posts/postsSlice'

type RESTResponse = {
  account: AccountId
  block_number: number
  post_id: PostId
  space_id: SpaceId
}

type ListPropsSpec = InfiniteScrollListProps<PostId>

export type PostsProps = {
  id: AccountId
  onScroll?: ListPropsSpec['onScroll']
  onScrollBeginDrag?: ListPropsSpec['onScrollBeginDrag']
  onScrollEndDrag?: ListPropsSpec['onScrollEndDrag']
}
export function Posts({ id, onScroll, onScrollBeginDrag, onScrollEndDrag }: PostsProps) {
  const { api } = useSubsocial()
  const dispatch = useAppDispatch()
  const styles = useThemedStyles()
  
  const loadInitial = useCallback<ListPropsSpec['loadInitial']>(async (pageSize) => {
    return [await loadFromREST(id, 0, pageSize), 1]
  }, [ id ])
  
  const loadMore = useCallback<ListPropsSpec['loadMore']>(async (page, pageSize) => {
    return await loadFromREST(id, page, pageSize)
  }, [ id ])
  
  const loadItems = useCallback<ListPropsSpec['loadItems']>(async (ids) => {
    await dispatch(fetchPosts({ api, ids }))
  }, [ api, dispatch ])
  
  const renderPost = useCallback((id: PostId) => <WrappedPost id={id} />, [])
  
  return (
    <InfiniteScrollList
      loadInitial={loadInitial}
      loadMore={loadMore}
      loadItems={loadItems}
      renderItem={renderPost}
      EmptyComponent={<Text mode="secondary" style={styles.empty}>No posts</Text>}
      onScroll={onScroll}
      onScrollBeginDrag={onScrollBeginDrag}
      onScrollEndDrag={onScrollEndDrag}
    />
  )
}

type WrappedPostProps = {
  id: PostId
}
const WrappedPost = React.memo(({ id }: WrappedPostProps) => {
  const styles = useThemedStyles()
  return <Post.Preview id={id} containerStyle={styles.post} />
})

async function loadFromREST(id: AccountId, page: number, pageSize: number) {
  const url = `${config.connections.rpc.offchain}/v1/offchain/activities/${id}/posts?offset=${page * pageSize}&limit=${pageSize}`
  const res = await axios.get<RESTResponse[]>(url)
  if (res.status !== 200) return []
  
  return res.data.map(({ post_id }) => post_id)
}

const useThemedStyles = createThemedStylesHook(({ colors }) => StyleSheet.create({
  post: {
    padding: 20,
    paddingBottom: 0,
    borderBottomWidth: 1,
    borderColor: colors.line,
  },
  empty: {
    textAlign: 'center',
    marginVertical: 10,
  },
}))
