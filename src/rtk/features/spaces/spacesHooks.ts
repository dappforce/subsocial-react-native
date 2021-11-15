import { useState } from 'react'
import { useActions } from 'src/rtk/app/helpers'
import { useAppSelector, useFetch } from 'src/rtk/app/hooksCommon'
import { fetchSpaces, SelectSpaceArgs, SelectSpacesArgs, selectSpaceStructById } from './spacesSlice'
import { PostId, SpaceContent, SpaceId, SpaceWithSomeDetails } from 'src/types/subsocial'
import { SubsocialSubstrateApi } from '@subsocial/api'
import { selectSpaceContentById } from '../contents/contentsSlice'
import { useSubsocial, useSubsocialEffect } from '~comps/SubsocialContext'
import { isDef } from '@subsocial/utils'

export const useSelectSpace = (spaceId?: SpaceId): SpaceWithSomeDetails | undefined => {
  const struct = useAppSelector(state => spaceId
    ? selectSpaceStructById(state, spaceId)
    : undefined
  )

  const cid = struct?.contentId
  const content = useAppSelector(state => cid
    ? selectSpaceContentById(state, cid)
    : undefined
  )

  if (!struct) return undefined

  return {
    id: struct.id,
    struct,
    content
  }
}

export function useSelectSpaces (ids: SpaceId[] = []): SpaceWithSomeDetails[] {
  const spaces = useAppSelector(state => ids.map(id => selectSpaceStructById(state, id))).filter(isDef)

  const contentByCidMap = new Map<string, SpaceContent>()
  useAppSelector(state => spaces.forEach(({ contentId }) => {
    if (contentId) {
      const content = selectSpaceContentById(state, contentId)
      content && contentByCidMap.set(contentId, content)
    }
  }))

  const results = spaces.map(struct => {
    const contentId = struct.contentId
    const content = contentId ? contentByCidMap.get(contentId) : undefined
    return { struct, content } as SpaceWithSomeDetails
  })

  return results
}

export const useFetchSpaces = (args: SelectSpacesArgs) => {
  return useFetch(fetchSpaces, args)
}

export const useFetchSpacesWithMyPermissions = (spaceIds: SpaceId[]) => {
  const { api } = useSubsocial()
  
  const args = { ids: spaceIds, api }
  const { loading: loadingSpaces } = useFetch(fetchSpaces, args)

  return { 
    loading:  loadingSpaces
  }
}

export const useCreateReloadSpace = () => {
  return useActions<SelectSpaceArgs>(({ dispatch, api, args: { id } }) => {
    const args = { api, ids: [ id ], reload: true }
    return dispatch(fetchSpaces(args))
  })  
}


// ===== Custom Solutions =====

export class SpaceNotFoundError extends Error {
  constructor(query: SpaceId) {
    super(`Subsocial Space ${query} not found`)
    this.name = 'SpaceNotFoundError'
  }
}

export const useResolvedSpaceHandle = (id: SpaceId) => {
  const [resolved] = useResolvedSpaceHandles([id])
  return resolved
}

export const useResolvedSpaceHandles = (ids: SpaceId[]) => {
  const [resolved, setResolved] = useState<PostId[]>([])
  useSubsocialEffect(async api => {
    setResolved(await resolveSpaceIds(api.substrate, ids))
  }, ids)
  return resolved
}

export async function resolveSpaceId(substrate: SubsocialSubstrateApi, id: SpaceId): Promise<SpaceId> {
  if (isHandle(id)) {
    const handle = (id as string).substr(1).toLowerCase()
    const spaceid = await substrate.getSpaceIdByHandle(handle)
    if (!spaceid) throw new SpaceNotFoundError(handle)
    return spaceid+''
  }
  else {
    return id
  }
}
export function resolveSpaceIds(substrate: SubsocialSubstrateApi, ids: SpaceId[]): Promise<SpaceId[]> {
  return Promise.all(ids.map(id => resolveSpaceId(substrate, id)))
}

const isHandle = (id: SpaceId) => typeof id === 'string' && id.startsWith('@')
