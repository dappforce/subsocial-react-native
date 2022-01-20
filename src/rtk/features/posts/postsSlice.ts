import { createAsyncThunk, createEntityAdapter, createSlice, EntityId } from '@reduxjs/toolkit'
import { getFirstOrUndefined } from '@subsocial/utils'
import { createFetchOne, createSelectUnknownIds, FetchManyArgs, HasHiddenVisibility, SelectManyArgs, selectManyByIds, SelectOneArgs, ThunkApiConfig } from 'src/rtk/app/helpers'
import { RootState } from 'src/rtk/app/rootReducer'
import { AccountId, asCommentStruct, asSharedPostStruct, flattenPostStructs, getUniqueContentIds, getUniqueOwnerIds, getUniqueSpaceIds, PostId, PostStruct, PostWithSomeDetails, ProfileData, SpaceData } from 'src/types/subsocial'
import { fetchContents, selectPostContentById } from '../contents/contentsSlice'
import { fetchProfiles, selectProfiles } from '../profiles/profilesSlice'
import { fetchMyReactionsByPostIds } from '../reactions/myPostReactionsSlice'
import { fetchSpaces } from '../spaces/spacesSlice'
import { selectSpaces } from 'src/rtk/features/spaces/spacesSlice'
import BN from 'bn.js'
import { isTempId } from 'src/util/post'

const postsAdapter = createEntityAdapter<PostStruct>()

const postsSelectors = postsAdapter.getSelectors<RootState>(state => state.posts)

// Rename the exports for readability in component usage
export const {
  selectById: selectPostStructById,
  selectIds: selectPostIds,
  selectEntities: selectPostEntities,
  selectAll: selectAllPosts,
  selectTotal: selectTotalPosts
} = postsSelectors

const _selectPostsByIds = (state: RootState, ids: EntityId[]) =>
  selectManyByIds(state, ids, selectPostStructById, selectPostContentById)

/** Should we fetch and select a space owner by default? */
const withSpaceOwner = { withOwner: false }

export type PostVisibility = HasHiddenVisibility

type Args = {
  visibility?: PostVisibility
  withContent?: boolean
  withOwner?: boolean
  withSpace?: boolean
  withExt?: boolean
  reload?: boolean
}

export type SelectPostArgs = SelectOneArgs<Args>
export type SelectPostsArgs = SelectManyArgs<Args>

type FetchPostsArgs = FetchManyArgs<Args & {
  withReactionByAccount?: AccountId
}>

type PostMap<D extends PostWithSomeDetails = PostWithSomeDetails> = Record<PostId, D>

export function selectPostMap
  <D extends PostWithSomeDetails = PostWithSomeDetails>
  (state: RootState, props: SelectPostsArgs): PostMap<D>
{
  const map: PostMap<D> = {}
  selectPosts(state, props).forEach((p) => map[p.id] = p as D)
  return map
}

// This method use only server side for get posts on space page
// TODO apply visibility filter
export function selectPosts (state: RootState, props: SelectPostsArgs): PostWithSomeDetails[] {
  const { ids, withOwner = true, withSpace = true, withExt = true } = props
  const posts = _selectPostsByIds(state, ids)
  
  const rootPostIds = new Set<PostId>()

  posts.forEach(({ struct }) => {
    if (struct.isComment) {
      const { rootPostId } = asCommentStruct(struct)
      rootPostIds.add(rootPostId)
    }
  })

  const rootPosts = _selectPostsByIds(state, Array.from(rootPostIds))

  const postsMap = selectPostEntities(state)

  // TODO Fix copypasta. Places: selectSpaces & selectPosts
  const ownerByIdMap = new Map<EntityId, ProfileData>()
  if (withOwner) {
    const ownerIds = getUniqueOwnerIds(posts)
    const profiles = selectProfiles(state, { ids: ownerIds })
    profiles.forEach(profile => {
      ownerByIdMap.set(profile.id, profile)
    })
  }

  const spaceByIdMap = new Map<EntityId, SpaceData>()
  if (withSpace) {
    const spaceIds = getUniqueSpaceIds(posts.concat(rootPosts))

    const spaces = selectSpaces(state, { ids: spaceIds, ...withSpaceOwner })
    spaces.forEach(space => {
      spaceByIdMap.set(space.id, space)
    })
  }
  
  const result: PostWithSomeDetails[] = []
  posts.forEach(post => {
    const { struct } = post
    const { ownerId, spaceId, isComment, isSharedPost } = struct

    // TODO Fix copypasta. Places: selectSpaces & selectPosts
    let owner: ProfileData | undefined
    if (ownerId) {
      owner = ownerByIdMap.get(ownerId)
    }

    // TODO Fix copypasta. Places: selectSpaces & selectPosts
    let space: SpaceData | undefined
    if (spaceId) {
      space = spaceByIdMap.get(spaceId)
    }

    if (isComment) {
      const { rootPostId } = asCommentStruct(struct)
      const rootPost = postsMap[rootPostId]

      if (rootPost) {
        space = spaceByIdMap.get(rootPost.spaceId!)
      }
    }

    let ext: PostWithSomeDetails | undefined

    if (withExt && isSharedPost) {
      const { sharedPostId } = asSharedPostStruct(struct)
      ext = getFirstOrUndefined(selectPosts(state, { ids: [ sharedPostId ]}))
    }

    // TODO select post ext for comment (?)

    result.push({ id: post.id, ext, post, owner, space })
  })
  return result
}

// TODO extract a generic function
export function selectPost (state: RootState, props: SelectPostArgs): PostWithSomeDetails | undefined {
  const { id, ...rest } = props
  const entities = selectPosts(state, { ids: [ id ], ...rest })
  return getFirstOrUndefined(entities)
}

const selectUnknownPostIds = createSelectUnknownIds(selectPostIds)

export const fetchPosts = createAsyncThunk<PostStruct[], FetchPostsArgs, ThunkApiConfig>(
  'posts/fetchMany',
  async (args, { getState, dispatch }) => {
    const { api, ids, withReactionByAccount, withContent = true, withOwner = true, withSpace = true, reload, visibility } = args
 
    let newIds = ids.filter(id => !isTempId(id+''))

    if (!reload) {
      newIds = selectUnknownPostIds(getState(), ids)
      if (!newIds.length) {
        // Nothing to load: all ids are known and their posts are already loaded.
        return []
      }
    }

    withReactionByAccount && dispatch(fetchMyReactionsByPostIds({ ids: newIds, myAddress: withReactionByAccount, api }))

    const structs = await api.substrate.findPosts({ ids: newIds.map(id => new BN(id)), visibility })

    const entities = flattenPostStructs(structs)

    const alreadyLoadedIds = new Set(newIds)
    const extPostIds = new Set<PostId>()

    const addToExtPostIds = (id: PostId) => {
      if (reload || !alreadyLoadedIds.has(id)) {
        extPostIds.add(id)
      }
    }

    entities.forEach((x) => {
      if (x.isComment) {
        addToExtPostIds(asCommentStruct(x).rootPostId)
      } else if (x.isSharedPost) {
        addToExtPostIds(asSharedPostStruct(x).sharedPostId)
      }
    })

    const newExtIds = selectUnknownPostIds(getState(), Array.from(extPostIds))
    const extStructs = await api.substrate.findPosts({ ids: newExtIds.map(id => new BN(id)), visibility: 'onlyPublic' })
    const extEntities = flattenPostStructs(extStructs)
    const allEntities = entities.concat(extEntities)

    const fetches: Promise<any>[] = []

    // TODO fetch shared post or comment

    if (withSpace) {
      const ids = getUniqueSpaceIds(allEntities)
      if (ids.length) {
        fetches.push(dispatch(fetchSpaces({ api, ids, ...withSpaceOwner })))
      }
    }

    if (withOwner) {
      const ids = getUniqueOwnerIds(allEntities)
      if (ids.length) {
        // TODO combine fetch of spaces' and posts' owners into one dispatch.
        fetches.push(dispatch(fetchProfiles({ api, ids })))
      }
    }

    if (withContent) {
      const ids = getUniqueContentIds(allEntities)
      if (ids.length) {
        // TODO combine fetch of spaces' and posts' contents into one dispatch.
        fetches.push(dispatch(fetchContents({ api, ids })))
      }
    }

    await Promise.all(fetches)

    return allEntities
  }
)

export const fetchPost = createFetchOne(fetchPosts)

const posts = createSlice({
  name: 'posts',
  initialState: postsAdapter.getInitialState(),
  reducers: {
    upsertPost: postsAdapter.upsertOne,
    removePost: postsAdapter.removeOne,
  },
  extraReducers: builder => {
    builder.addCase(fetchPosts.fulfilled, postsAdapter.upsertMany)
    // builder.addCase(fetchPosts.rejected, (state, action) => {
    //   state.error = action.error
    // })
  }
})

export const {
  upsertPost,
  removePost
} = posts.actions

export default posts.reducer
