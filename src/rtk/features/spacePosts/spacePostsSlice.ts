//////////////////////////////////////////////////////////////////////
// Custom Slice for Posts associated with a Space
import { createAsyncThunk, createSlice, EntityId, PayloadAction } from '@reduxjs/toolkit'
import { ApiArg, ThunkApiConfig } from 'src/rtk/app/helpers'
import { PostId, SpaceId } from 'src/types/subsocial'
import BN from 'bn.js'
import { asString } from '@subsocial/utils'
import { RootState } from 'src/rtk/app/rootReducer'

type SpacePostMap = Record<EntityId, PostId[]>

export type RefreshPayload = {
  id: EntityId
  posts: PostId[]
}

type FetchSpacePostsArgs = ApiArg & {
  id: EntityId
}

export const fetchSpacePosts = createAsyncThunk<RefreshPayload, FetchSpacePostsArgs, ThunkApiConfig>(
  'spacePosts/refresh',
  async ({ api, id }) => {
    
    if (!id) return {id, posts: []}
    
    const postIds = await api.substrate.postIdsBySpaceId(new BN(id))
    
    return {
      id,
      posts: postIds.map(asString),
    }
    
  }
)

export const selectSpacePosts = (state: RootState, id: SpaceId) => state.spacePosts[id]

const spacePosts = createSlice({
  name: 'spacePosts',
  initialState: {} as SpacePostMap,
  reducers: {},
  extraReducers: (builder) => {
    builder.addCase(fetchSpacePosts.fulfilled, (state, action) => {
      const {id, posts} = action.payload
      
      if (!id) return
      
      state[id] = posts
    })
  },
})

export default spacePosts.reducer
