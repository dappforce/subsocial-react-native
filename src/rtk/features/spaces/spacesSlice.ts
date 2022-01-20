import { createAsyncThunk, createEntityAdapter, createSlice, EntityId } from '@reduxjs/toolkit'
import { getFirstOrUndefined } from '@subsocial/utils'
import { createFetchOne, createSelectUnknownIds, FetchManyArgs, HasHiddenVisibility, SelectManyArgs, selectManyByIds, SelectOneArgs, ThunkApiConfig } from 'src/rtk/app/helpers'
import { RootState } from 'src/rtk/app/rootReducer'
import { flattenSpaceStructs, getUniqueContentIds, getUniqueOwnerIds, SpaceId, SpaceStruct, SpaceWithSomeDetails } from 'src/types/subsocial'
import { fetchContents, selectSpaceContentById } from '../contents/contentsSlice'
import { fetchProfiles } from '../profiles/profilesSlice'
import BN from 'bn.js'

const spacesAdapter = createEntityAdapter<SpaceStruct>()

const spacesSelectors = spacesAdapter.getSelectors<RootState>(state => state.spaces)

// Rename the exports for readability in component usage
export const {
  selectById: selectSpaceStructById,
  selectIds: selectSpaceIds,
  selectEntities: selectSpaceEntities,
  selectAll: selectAllSpaces,
  selectTotal: selectTotalSpaces
} = spacesSelectors

export type SpaceVisibility = HasHiddenVisibility

type Args = {
  visibility?: SpaceVisibility
  withContent?: boolean
  withOwner?: boolean
}

export type SelectSpaceArgs = SelectOneArgs<Args>
export type SelectSpacesArgs = SelectManyArgs<Args>

// eslint-disable-next-line @typescript-eslint/no-unused-vars
// type FetchSpaceArgs = FetchOneArgs<Args>
type FetchSpacesArgs = FetchManyArgs<Args>

const _selectSpacesByIds = (state: RootState, ids: EntityId[]) =>
  selectManyByIds(state, ids, selectSpaceStructById, selectSpaceContentById)

// TODO apply visibility filter
export function selectSpaces (state: RootState, props: SelectSpacesArgs): SpaceWithSomeDetails[] {
  const { ids, /* withOwner = true */ } = props
  return _selectSpacesByIds(state, ids)
}

// TODO extract a generic function
export function selectSpace (state: RootState, props: SelectSpaceArgs): SpaceWithSomeDetails | undefined {
  return getFirstOrUndefined(selectSpaces(state, { ids: [ props.id ] }))
}

const selectUnknownSpaceIds = createSelectUnknownIds(selectSpaceIds)

export const fetchSpaces = createAsyncThunk<SpaceStruct[], FetchSpacesArgs, ThunkApiConfig>(
  'spaces/fetchMany',
  async ({ api, ids, withContent = true, withOwner = true, reload, visibility }, { getState, dispatch }) => {

    let newIds: SpaceId[] = ids as string[]

    if (!reload) {
      newIds = selectUnknownSpaceIds(getState(), ids)
      if (!newIds.length) {
        // Nothing to load: all ids are known and their spaces are already loaded.
        return []
      }
    } 

    const structs = await api.substrate.findSpaces({ ids: newIds.map(id => new BN(id)), visibility })
    const entities = flattenSpaceStructs(structs)
    const fetches: Promise<any>[] = []
    
    if (withOwner) {
      const ids = getUniqueOwnerIds(entities)
      if (ids.length) {
        // TODO combine fetch of spaces' and posts' owners into one dispatch.
        fetches.push(dispatch(fetchProfiles({ api, ids })))
      }
    }
    
    if (withContent) {
      const ids = getUniqueContentIds(entities)
      if (ids.length) {
        // TODO combine fetch of spaces' and posts' contents into one dispatch.
        fetches.push(dispatch(fetchContents({ api, ids })))
      }
    }

    await Promise.all(fetches)

    return entities
  }
)

export const fetchSpace = createFetchOne(fetchSpaces)

const spaces = createSlice({
  name: 'spaces',
  initialState: spacesAdapter.getInitialState(),
  reducers: {
    updateSpace: spacesAdapter.updateOne
  },
  extraReducers: builder => {
    builder.addCase(fetchSpaces.fulfilled, spacesAdapter.upsertMany)
    // builder.addCase(fetchSpaces.rejected, (state, action) => {
    //   state.error = action.error
    // })
  }
})

export default spaces.reducer
