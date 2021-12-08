import { createAsyncThunk, createEntityAdapter, createSlice } from '@reduxjs/toolkit'
import { isEmptyArray } from '@subsocial/utils'
import BN from 'bn.js'
import { ApiArg, CommonFetchProps, createSelectUnknownIds, SelectManyArgs, SelectOneArgs, ThunkApiConfig } from 'src/rtk/app/helpers'
import { RootState } from 'src/rtk/app/rootReducer'
import { AccountId, PostId, PostStructWithRoot, PostWithSomeDetails } from 'src/types/subsocial'
import { fetchPost, fetchPosts, selectPost } from '../posts/postsSlice'

export type ReplyIdsByPostId = {
  /** `id` is a parent id of replies. */
  id: PostId
  replyIds: PostId[]
}

export type RepliesByPostIdMap = Record<PostId, PostWithSomeDetails[]>

const adapter = createEntityAdapter<ReplyIdsByPostId>()

const selectors = adapter.getSelectors<RootState>(state => state.replyIds)

// Rename the exports for readability in component usage
export const {
  selectById: selectReplyIds,
  selectIds: selectParentIds,
  selectEntities: selectReplyIdsEntities,
  selectAll: selectAllReplyIds,
  selectTotal: selectTotalParentIds
} = selectors

type Args = {}

export type SelectOnePostRepliesArgs = SelectOneArgs<Args>
export type SelectManyPostRepliesArgs = SelectManyArgs<Args>
export type SelectReplyParentArgs = ApiArg & {
  id: PostId
  onlyComments?: boolean
}

type FetchManyPostRepliesArgs = CommonFetchProps & {
  id: PostId,
  myAddress?: AccountId
}

const selectUnknownParentIds = createSelectUnknownIds(selectParentIds)

export function selectReplyParentId (state: RootState, { id: postId, onlyComments }: SelectReplyParentArgs) {
  const id = Object.values(state.replyIds.entities).find(reply => {
    if (!reply) return false
    
    return reply.replyIds.includes(postId.toString())
  })?.id
  
  if (!onlyComments) return id
  
  if (!id) return undefined
  
  const parent = selectPost(state, { id })
  if (!parent?.post.struct.isComment) return undefined
  
  return id
}

export function selectManyReplyIds (state: RootState, { ids: parentIds }: SelectManyPostRepliesArgs): ReplyIdsByPostId[] {
  if (isEmptyArray(parentIds)) return []

  const uniqueParentIds = new Set(parentIds)
  return selectAllReplyIds(state)
    .filter(({ id: parentId }) => uniqueParentIds.has(parentId))
}

// export function selectManyPostReplies (state: RootState, { ids: parentIds }: SelectManyPostRepliesArgs): RepliesByPostIdMap {
//   const replyIds = selectManyReplyIds(state, { ids: parentIds })
  
//   if (!replyIds.length) return {}

//   const res: RepliesByPostIdMap = {}
//   replyIds.forEach(({ id: parentId, replyIds }) => {
//     const replies = selectPosts(state, { ids: replyIds, withSpace: false })
//     res[parentId] = replies
//   })

//   return res
// }

// export function selectOnePostReplies (state: RootState, { id: parentId }: SelectOnePostRepliesArgs): PostWithSomeDetails[] {
//   return selectManyPostReplies(state, { ids: [ parentId ]})[parentId] || []
// }

export const fetchPostReplyIds = createAsyncThunk<ReplyIdsByPostId[], FetchManyPostRepliesArgs, ThunkApiConfig>(
  'replyIds/fetchMany',
  async (args, { getState, dispatch }) => {
    const { id: parentId, myAddress, api, reload } = args
    
    const parentIds = reload ? [ parentId ] : selectUnknownParentIds(getState(), [ parentId ])
    if (!parentIds.length) {
      // Nothing to load: all ids are known and their replyIds are already loaded.
      return []
    }
    
    const replyBnIds = await api.substrate.getReplyIdsByPostId(new BN(parentId))
    const replyIds = replyBnIds.map(id => id.toString())

    await dispatch(fetchPosts({ api, withReactionByAccount: myAddress, ids: replyIds, withSpace: false, reload }))

    return [ {
      id: parentId,
      replyIds
    } ]
  }
)

// TODO: postReply = createAsyncThunk for posting own reply w/ signed tx. Also upsertOne immediately & removeOne when failed

const replyIds = createSlice({
  name: 'replyIds',
  initialState: adapter.getInitialState(),
  reducers: {
    upsertReplyIdsByPostId: adapter.upsertOne,
    removeReplyIdsByPostId: adapter.removeOne,
  },
  extraReducers: builder => {
      builder
        .addCase(fetchPostReplyIds.fulfilled, adapter.upsertMany)
    }
})

export const {
  upsertReplyIdsByPostId,
} = replyIds.actions

export default replyIds.reducer
