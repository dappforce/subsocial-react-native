import { useActions } from 'src/rtk/app/helpers'
import { useAppSelector } from 'src/rtk/app/store'
import { PostId, SpaceId } from 'src/types/subsocial'
import { refreshSpacePosts } from './spacePostsSlice'
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

export type RefreshSpacePostsArgs = {
  id: SpaceId
}

export const useRefreshSpacePosts = () => useActions<RefreshSpacePostsArgs>(({ api, dispatch, args: { id } }) => {
  dispatch(refreshSpacePosts({ api, id }))
})
