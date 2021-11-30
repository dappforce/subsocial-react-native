import React, { useCallback, useRef, useState } from 'react'
import { StyleSheet } from 'react-native'
import { useSubsocial } from '~comps/SubsocialContext'
import { useAppDispatch } from 'src/rtk/app/hooksCommon'
import { fetchPosts } from 'src/rtk/features/posts/postsSlice'
import { AccountId, PostId } from 'src/types/subsocial'
import { Text } from '~comps/Typography'
import { InfiniteScrollList, InfiniteScrollListProps } from '~stories/Misc'
import { Preview } from '../Post/Preview'
import axios from 'axios'
import { AxiosResponseError } from 'src/types/errors'
import { descending, difference, union } from 'src/util'
import { logger as createLogger } from '@polkadot/util'
import config from 'config.json'

const log = createLogger('Account/Upvotes')

type OffchainResponse = {
  post_id: PostId
}

type ListPropsSpec = InfiniteScrollListProps<PostId>

export type UpvotesProps = {
  id: AccountId
  onScroll?: ListPropsSpec['onScroll']
  onScrollBeginDrag?: ListPropsSpec['onScrollBeginDrag']
  onScrollEndDrag?: ListPropsSpec['onScrollEndDrag']
}
export function Upvotes({ id, onScroll, onScrollBeginDrag, onScrollEndDrag }: UpvotesProps) {
  const { api } = useSubsocial()
  const dispatch = useAppDispatch()
  const [ error, setError ] = useState<Error | undefined>(undefined)
  const knownIds = useRef<Set<PostId>>(new Set())
  
  const loadInitial = useCallback<ListPropsSpec['loadInitial']>(async (pageSize) => {
    try {
      knownIds.current = new Set(await loadFromREST(id, 0, pageSize))
      const ids = [...knownIds.current].sort(descending)
      return [ids, 1]
    }
    catch (err) {
      log.error(err)
      if (err instanceof Error) setError(err)
      return [[], 0]
    }
  }, [ id ])
  
  const loadMore = useCallback<ListPropsSpec['loadMore']>(async (page, pageSize) => {
    try {
      const unfilteredIds = await loadFromREST(id, page, pageSize)
      const ids = [...difference(unfilteredIds, knownIds.current)].sort(descending)
      
      knownIds.current = union(knownIds.current, ids)
      if (!ids.length) return false
      
      return ids
    }
    catch (err) {
      log.error(err)
      if (err instanceof Error) setError(err)
      return []
    }
  }, [ id ])
  
  const loadItems = useCallback<ListPropsSpec['loadItems']>(async (ids) => {
    await dispatch(fetchPosts({ api, ids, reload: true }))
  }, [ api, dispatch ])
  
  const renderItem = useCallback((id: PostId) => {
    return <Preview id={id} />
  }, [ id ])
  
  if (error) {
    return (
      <>
        <Text style={styles.centerText}>An error occurred while loading upvotes of this account:</Text>
        <Text style={styles.centerText}>{error.message}</Text>
      </>
    )
  }
  
  else {
    return (
      <InfiniteScrollList
        loadInitial={loadInitial}
        loadMore={loadMore}
        loadItems={loadItems}
        renderItem={renderItem}
        onScroll={onScroll}
        onScrollBeginDrag={onScrollBeginDrag}
        onScrollEndDrag={onScrollEndDrag}
      />
    )
  }
}

async function loadFromREST(id: AccountId, page: number, pageSize: number) {
  const url = `${config.connections.rpc.offchain}/v1/offchain/activities/${id}/reactions?offset=${page * pageSize}&limit=${pageSize}`
  const res = await axios.get<OffchainResponse[]>(url)
  if (res.status !== 200) throw new AxiosResponseError(res)
  
  return res.data.map(({ post_id }) => post_id)
}

const styles = StyleSheet.create({
  centerText: {
    textAlign: 'center',
    marginVertical: 10,
  },
})
