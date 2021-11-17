import { useActions } from 'src/rtk/app/helpers'
import { useAppSelector } from 'src/rtk/app/hooksCommon'
import { AccountId } from 'src/types/subsocial'
import { fetchEntityOfAccountIdsByFollower, selectAccountIdsByFollower } from './followedAccountIdsSlice'

export const useSelectAccountIdsByFollower = (followerId: AccountId) =>
  useAppSelector(state => selectAccountIdsByFollower(state, followerId) ?? [])

export const useCreateReloadAccountIdsByFollower = () => {
  return useActions<AccountId>(({ dispatch, args: id, ...props }) => {
    return dispatch(fetchEntityOfAccountIdsByFollower({ id, reload: true, ...props }))
  })
}
