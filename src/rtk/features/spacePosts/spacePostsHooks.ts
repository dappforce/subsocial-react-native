import { useMemo } from 'react'
import { useSubsocial } from '~comps/SubsocialContext'
import { useAppDispatch, useAppSelector } from 'src/rtk/app/hooksCommon'
import { PostId, SpaceId } from 'src/types/subsocial'
import { fetchSpacePosts } from './spacePostsSlice'
import { descending } from 'src/util'

export function useSelectSpacePosts(spaceId?: SpaceId): PostId[] {
  return [...useAppSelector(state => spaceId && state.spacePosts[spaceId] || [])].sort(descending)
}

export function useSelectSpacesPosts(spaceIds?: SpaceId[]): PostId[] {
  return useAppSelector(state => {
    if (!spaceIds) return []
    
    return spaceIds.reduce((result, spaceId) => {
      return result.concat(state.spacePosts[spaceId] ?? [])
    }, [] as PostId[]).sort(descending)
  })
}

export type FetchSpacePostsArgs = {
  id: SpaceId
}

export const useFetchSpacePosts = () => {
  const dispatch = useAppDispatch()
  const { api } = useSubsocial()
  
  return useMemo(() => {
    if (!api) return
    
    return ({ id }: FetchSpacePostsArgs) => {
      return dispatch(fetchSpacePosts({ api, id }))
    }
  }, [ api ])
}
