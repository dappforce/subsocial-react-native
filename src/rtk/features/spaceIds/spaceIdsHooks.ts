// import { useMyAddress } from 'src/components/auth/MyAccountContext'
import { useActions } from 'src/rtk/app/helpers'
import { useFetchOneEntity } from 'src/rtk/app/hooksCommon'
import { AccountId } from 'src/types/subsocial'
import { fetchEntityOfSpaceIdsByFollower, selectEntityOfSpaceIdsByFollower } from './followedSpaceIdsSlice'
import { fetchSpaceIdsOwnedByAccount, selectEntityOfSpaceIdsByOwner, selectSpaceIdsByOwner } from './ownSpaceIdsSlice'
import { useAppSelector } from 'src/rtk/app/hooksCommon'
import { shallowEqual } from 'react-redux'

export const useFetchSpaceIdsByOwner = (owner: AccountId) => {
  const { entity, ...other } = useFetchOneEntity(
    selectEntityOfSpaceIdsByOwner,
    fetchSpaceIdsOwnedByAccount,
    { id: owner }
  )

  return {
    spaceIds: entity?.ownSpaceIds || [],
    ...other
  }
}

export const useFetchSpaceIdsByFollower = (follower: AccountId) => {
  const { entity, ...other } = useFetchOneEntity(
    selectEntityOfSpaceIdsByFollower,
    fetchEntityOfSpaceIdsByFollower,
    { id: follower }
  )

  return {
    spaceIds: entity?.followedSpaceIds || [],
    ...other
  }
}

export const useCreateReloadSpaceIdsRelatedToAccount = () => {
  return useActions<AccountId>(({ dispatch, args: id, ...props }) => {
    return dispatch(fetchSpaceIdsOwnedByAccount({ id, reload: true, ...props }))
  })
}

/** Reload three lists of space ids: that I own, I follow, I have any role. */
// export const useCreateReloadSpaceIdsForMyAccount = () => {
//   const myAddress = useMyAddress()

//   return useActions<void>(({ dispatch, ...props }) => {
//     if (myAddress) {
//       dispatch(fetchSpaceIdsOwnedByAccount({ id: myAddress, reload: true, ...props }))
//       dispatch(fetchEntityOfSpaceIdsByFollower({ id: myAddress, reload: true, ...props }))
//     }
//   })
// }

/** Select two lists of space ids: that I own, I gave any role */
export const useSelectSpaceIdsWhereAccountCanPost = (address?: AccountId) => useAppSelector(state => {
  if (!address) return []
  const ownSpaceIds = selectSpaceIdsByOwner(state, address)
  return [ ...new Set(ownSpaceIds) ]
}, shallowEqual)
