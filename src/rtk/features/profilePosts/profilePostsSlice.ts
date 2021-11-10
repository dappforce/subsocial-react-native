//////////////////////////////////////////////////////////////////////
// Pseudo-slice to follow naming conventions
// doesn't actually provide reduces or state
// data is stored in other slices already, i.e. spaceIdsSlice & postsSlice
import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit'
import { ApiArg, ThunkApiConfig } from 'src/rtk/app/helpers'
import { AccountId, EntityId, PostId, SpaceId } from 'src/types/subsocial'
import { descending } from 'src/util'
import { fetchPosts } from '../posts/postsSlice'
import { fetchSpaceIdsOwnedByAccount, selectEntityOfSpaceIdsByOwner } from '../spaceIds/ownSpaceIdsSlice'
import { fetchSpacePosts } from '../spacePosts/spacePostsSlice'

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
      const postIdsSet = spaceIds.reduce((set, spaceId) => {
        const ids = state.spacePosts[spaceId]
        ids?.forEach?.(id => set.add(id))
        return set
      }, new Set() as Set<PostId>)
      
      const postIds = [...postIdsSet].sort(descending)
      
      return {
        id,
        posts: postIds,
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
