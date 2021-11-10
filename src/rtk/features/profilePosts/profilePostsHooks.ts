import { useMemo } from 'react'
import { ApiArg } from 'src/rtk/app/helpers'
import { useAppDispatch, useAppSelector } from 'src/rtk/app/hooksCommon'
import { AccountId, PostId } from 'src/types/subsocial'
import { useSubsocial } from '~comps/SubsocialContext'
import { fetchProfilePostIds, FetchProfilePostsArgs } from './profilePostsSlice'

export const useSelectProfilePosts = (accountId: AccountId | undefined): [boolean, PostId[]] => {
  const loading = useAppSelector(state => state.profilePosts.loading)
  
  const postIds = useAppSelector(state => accountId && state.profilePosts.data[accountId] || [])
  
  return [ loading, postIds ]
}

export const useCreateReloadProfilePosts = () => {
  const dispatch = useAppDispatch()
  const { api } = useSubsocial()
  
  return useMemo(() => {
    if (!api) return
    
    return ((args: Omit<FetchProfilePostsArgs, keyof ApiArg>) => {
      return dispatch(fetchProfilePostIds({ ...args, api }))
    })
  }, [ api, dispatch ])
}
