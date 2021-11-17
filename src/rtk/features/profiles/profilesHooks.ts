import { useActions } from 'src/rtk/app/helpers'
import { useAppSelector, useFetch, useFetchEntity, useFetchOneEntity } from 'src/rtk/app/hooksCommon'
import { AccountId, ProfileData } from 'src/types/subsocial'
import { selectProfileContentById } from '../contents/contentsSlice'
import { selectEntityOfAccountIdsByFollower, fetchEntityOfAccountIdsByFollower } from './followedAccountIdsSlice'
import { fetchProfiles, SelectProfileArgs, SelectProfilesArgs, selectProfileStructById } from './profilesSlice'

export const useSelectProfile = (accountId?: AccountId): ProfileData | undefined => {
  const struct = useAppSelector(state => accountId
    ? selectProfileStructById(state, accountId)
    : undefined
  )

  const cid = struct?.contentId
  const content = useAppSelector(state => cid
    ? selectProfileContentById(state, cid)
    : undefined
  )

  if (!struct || !content) return undefined

  return {
    id: struct.id,
    struct,
    content
  }
}

export const useFetchProfile = (args: SelectProfileArgs) => {
  return useFetchEntity(useSelectProfile, fetchProfiles, args)
}

export const useFetchProfiles = (args: SelectProfilesArgs) => {
  return useFetch(fetchProfiles, args)
}

export const useCreateReloadProfile = () => {
  return useActions<SelectProfileArgs>(({ dispatch, api, args: { id } }) => {
    return dispatch(fetchProfiles({ api, ids: [ id ], reload: true }))
  })
}

export const useFetchAccountIdsByFollower = (follower: AccountId) => {
  return useFetchOneEntity(
    selectEntityOfAccountIdsByFollower,
    fetchEntityOfAccountIdsByFollower,
    { id: follower }
  )
}
