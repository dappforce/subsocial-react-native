import { useAppDispatch, useAppSelector } from 'src/rtk/app/hooksCommon'
import { AccountId, SpaceId } from 'src/types/subsocial'
import { useSubsocial } from '~comps/SubsocialContext'
import { fetchEntityOfSpaceIdsByFollower, selectSpaceIdsByFollower } from './followedSpaceIdsSlice'

const EMPTY_FOLLOWS: SpaceId[] = []

export const useSelectSpaceIdsByFollower = (address: string) => useAppSelector(state => selectSpaceIdsByFollower(state, address)) ?? EMPTY_FOLLOWS

export const useCreateReloadSpaceIdsByFollower = () => {
  const dispatch = useAppDispatch()
  const { api } = useSubsocial()
  
  if (!api) return undefined
  return (id: AccountId) => dispatch(fetchEntityOfSpaceIdsByFollower({ api, id }))
}
