//////////////////////////////////////////////////////////////////////
// Pseudo-slice to follow naming conventions
// doesn't actually provide reduces or state
// data is stored in other slices already, i.e. spaceIdsSlice & postsSlice
import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit'
import { ApiArg, ThunkApiConfig } from 'src/rtk/app/helpers'
import { AccountId, EntityId, PostId, SpaceId } from 'src/types/subsocial'
import { descending } from 'src/util'
import { fetchPosts, selectPosts } from '../posts/postsSlice'
import { fetchSpaceIdsOwnedByAccount, selectEntityOfSpaceIdsByOwner } from '../spaceIds/ownSpaceIdsSlice'
import { fetchSpacePosts } from '../spacePosts/spacePostsSlice'
import { logger as createLogger } from '@polkadot/util'
import { pluralize } from '@subsocial/utils'

const logger = createLogger('profilePostsSlice')


type ProfilePostsState = {
  loading: boolean
  data: ProfilePostsMap
}
type ProfilePostsMap = Record<AccountId, PostId[]>

type ProfilePostsPayload = {
  id: EntityId
  posts: PostId[]
}

export type FetchProfilePostsArgs = ApiArg & {
  id: AccountId
  reload?: boolean
}

export const fetchProfilePostIds = createAsyncThunk<ProfilePostsPayload, FetchProfilePostsArgs, ThunkApiConfig>(
  'profilePosts/fetch',
  async ({ id, api, reload }, { dispatch, getState }) => {
    dispatch(setLoading(true))
    
    try {
      await dispatch(fetchSpaceIdsOwnedByAccount({ id, api, reload }))
      
      const spaceIds: SpaceId[] = selectEntityOfSpaceIdsByOwner(getState(), { id })?.ownSpaceIds ?? []
      await Promise.all(spaceIds.map(
        spaceId => dispatch(fetchSpacePosts({ id: spaceId, api }))
      ))
      
      const state = getState()
      const unfiltered = [...spaceIds.reduce((set, spaceId) => {
        const ids = state.spacePosts[spaceId]
        ids?.forEach?.(id => set.add(id))
        return set
      }, new Set() as Set<PostId>)]
      
      const t0 = Date.now()
      
      await dispatch(fetchPosts({
        ids: unfiltered,
        api,
        withContent: false,
        withOwner: true,
        withSpace: false,
      }))
      const posts = selectPosts(getState(), { ids: unfiltered })
      
      const filtered = posts.filter(({ post }) => post.struct.ownerId === id)
      logger.debug(`filtered ${unfiltered.length} ${pluralize(unfiltered.length, 'post')} in ${Date.now() - t0}ms`)
      
      return {
        id,
        posts: filtered.map(struct => struct.id).sort(descending),
      }
    }
    finally {
      dispatch(setLoading(false))
    }
  }
)

const profilePosts = createSlice({
  name: 'profilePosts',
  initialState: {
    loading: false,
    data: {},
  } as ProfilePostsState,
  reducers: {
    setLoading(state, action: PayloadAction<boolean>) {
      state.loading = action.payload
    }
  },
  extraReducers: builder => {
    builder.addCase(fetchProfilePostIds.fulfilled, (state, { payload }) => {
      const { id, posts } = payload
      
      if (!id) return
      
      state.data[id] = posts
    })
  },
})

export default profilePosts.reducer
var { setLoading } = profilePosts.actions
