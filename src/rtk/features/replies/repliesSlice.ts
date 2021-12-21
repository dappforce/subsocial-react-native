import { MutableRefObject, Ref } from 'react'
import { createAsyncThunk, createEntityAdapter, createSlice, PayloadAction } from '@reduxjs/toolkit'
import { isEmptyArray } from '@subsocial/utils'
import { CommonFetchProps, createSelectUnknownIds, SelectManyArgs, SelectOneArgs, ThunkApiConfig } from 'src/rtk/app/helpers'
import { RootState } from 'src/rtk/app/rootReducer'
import * as Tx from 'src/tx'
import { AccountId, PostId, PostWithSomeDetails } from 'src/types/subsocial'
import { fetchPost, fetchPosts, removePost, selectPost, upsertPost } from '../posts/postsSlice'
import { createMockStruct, MockStructArgs } from 'src/util/post'
import { logger as createLogger } from '@polkadot/util'
import BN from 'bn.js'

const log = createLogger('repliesSlice')

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
export type SelectReplyParentArgs = {
  id: PostId
  onlyComments?: boolean
}
export type CreatePostReplyArgs = Tx.CreateCommentArgs & {
  idRef?: Ref<PostId>
  address: AccountId
  struct?: MockStructArgs
}
export type ReplyPayload = {
  parentId: PostId
  postId: PostId
}
export type ReplaceReplyPayload = {
  parentId: PostId
  oldPostId: PostId
  newPostId: PostId
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

export const createPostReply = createAsyncThunk<void, CreatePostReplyArgs, ThunkApiConfig>(
  'replyIds/create',
  async ({ idRef, address, struct, ...args }, { getState, dispatch }) => {
    const { api, parent } = args
    const { tmpId, id } = Tx.createComment(args)
    
    const setIdRef = (id: PostId) => {
      if (idRef) {
        if (typeof idRef === 'function') {
          idRef(id)
        }
        else {
          (idRef as MutableRefObject<PostId>).current = id
        }
      }
    }
    
    // Insert temp/mock reply
    setIdRef(tmpId)
    const mockStruct = createMockStruct({ id: tmpId, address, type: 'comment', ...struct })
    await dispatch(upsertPost(mockStruct))
    await dispatch(insertReply({ parentId: parent.id, postId: tmpId }))
    
    // Replace temp/mock reply with on-chain data
    const realId = await id
    setIdRef(realId)
    await dispatch(removePost(tmpId))
    await dispatch(fetchPost({ api, id: realId, reload: true }))
    await dispatch(replaceReply({ parentId: parent.id, oldPostId: tmpId, newPostId: realId }))
  }
)

const replyIds = createSlice({
  name: 'replyIds',
  initialState: adapter.getInitialState(),
  reducers: {
    upsertReplyIdsByPostId: adapter.upsertOne,
    removeReplyIdsByPostId: adapter.removeOne,
    insertReply: (state, { payload: { parentId, postId } }: PayloadAction<ReplyPayload>) => {
      const oldReplyIds = state.entities[parentId]?.replyIds ?? []
      
      state.entities[parentId] = {
        id: parentId,
        replyIds: [ ...oldReplyIds, postId ],
      }
    },
    removeReply: (state, { payload: { parentId, postId } }: PayloadAction<ReplyPayload>) => {
      const ntt = state.entities[parentId]
      if (ntt) {
        const idx = ntt.replyIds.indexOf(postId)
        if (idx !== -1) {
          ntt.replyIds.splice(idx, 1)
        }
      }
      state.entities[parentId]?.replyIds.filter(id => id !== postId)
    },
    replaceReply: (state, { payload: { parentId, oldPostId, newPostId } }: PayloadAction<ReplaceReplyPayload>) => {
      const ntt = state.entities[parentId]
      if (ntt) {
        const oldIdx = ntt.replyIds.indexOf(oldPostId)
        if (oldIdx !== -1) {
          ntt.replyIds[oldIdx] = newPostId
        }
        else {
          log.debug(`Post ${parentId} does not have reply ${oldPostId}`)
        }
      }
    },
  },
  extraReducers: builder => {
    builder
      .addCase(fetchPostReplyIds.fulfilled, adapter.upsertMany)
  }
})

export const {
  upsertReplyIdsByPostId,
  removeReplyIdsByPostId,
  insertReply,
  removeReply,
  replaceReply,
} = replyIds.actions

export default replyIds.reducer
