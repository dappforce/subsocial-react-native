import { useActions } from 'src/rtk/app/helpers'
import { useSelectKeypair } from 'src/rtk/app/hooks'
import { useFetch } from 'src/rtk/app/hooksCommon'
import { PostId } from 'src/types/subsocial'
import { fetchMyReactionsByPostIds, prependPostIdWithMyAddress, ReactionStruct, upsertMyReaction } from './myPostReactionsSlice'

export const useFetchMyReactionsByPostId = (postId: PostId) => {
  return useFetchMyReactionsByPostIds([ postId ])
}

export const useFetchMyReactionsByPostIds = (postIds: PostId[]) => {
  const { address } = useSelectKeypair() ?? {}
  
  return useFetch(
    fetchMyReactionsByPostIds,
    { ids: postIds, myAddress: address }
  )
}

export const useCreateUpsertMyReaction = () => {
  const { address } = useSelectKeypair() ?? {}
  
  return useActions<ReactionStruct>(({ dispatch, args: { id: postId, reactionId, kind } }) => {
    return address && dispatch(upsertMyReaction({
      id: prependPostIdWithMyAddress(postId, address),
      reactionId,
      kind
    }))
  })
}