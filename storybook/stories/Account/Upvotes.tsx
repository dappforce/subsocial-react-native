import React, { useCallback } from 'react'
import { useSubsocial } from '~comps/SubsocialContext'
import { useAppDispatch } from 'src/rtk/app/hooksCommon'
import { fetchPosts } from 'src/rtk/features/posts/postsSlice'
import { AccountId, PostId } from 'src/types/subsocial'
import { InfiniteScrollList, InfiniteScrollListProps } from '~stories/Misc'
import { Preview } from '../Post/Preview'
import { default as axios } from 'axios'
import config from 'config.json'

type OffchainResponse = {
  post_id: PostId
}

export type UpvotesProps = {
  id: AccountId
  onScroll?: InfiniteScrollListProps<PostId>['onScroll']
  onScrollBeginDrag?: InfiniteScrollListProps<PostId>['onScrollBeginDrag']
  onScrollEndDrag?: InfiniteScrollListProps<PostId>['onScrollEndDrag']
}
export function Upvotes({ id, onScroll, onScrollBeginDrag, onScrollEndDrag }: UpvotesProps) {
  const url = `${config.connections.rpc.offchain}/v1/offchain/activities/${id}/reactions`
  const { api } = useSubsocial()
  const dispatch = useAppDispatch()
  
  const ids = useCallback(async () => {
    const res = await axios.get<OffchainResponse[]>(url)
    const ids = res.data.map(({ post_id }) => post_id)
    return ids
  }, [ id ])
  
  const loader = useCallback(async (ids: PostId[]) => {
    await dispatch(fetchPosts({ api, ids }))
    return ids
  }, [ api, dispatch ])
  
  const renderItem = useCallback((id: PostId) => {
    return <Preview id={id} />
  }, [ id ])
  
  return (
    <InfiniteScrollList
      ids={ids}
      loader={loader}
      renderItem={renderItem}
      onScroll={onScroll}
      onScrollBeginDrag={onScrollBeginDrag}
      onScrollEndDrag={onScrollEndDrag}
    />
  )
}
