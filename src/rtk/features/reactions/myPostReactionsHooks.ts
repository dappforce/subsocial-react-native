import { useMyAddress } from 'src/components/auth/MyAccountContext'
import { useActions } from 'src/rtk/app/helpers'
import { useFetch } from 'src/rtk/app/hooksCommon'
import { PostId } from 'src/types'
import { fetchMyReactionsByPostIds, prependPostIdWithMyAddress, ReactionStruct, upsertMyReaction } from './myPostReactionsSlice'

export const useFetchMyReactionsByPostId = (postId: PostId) => {
  return useFetchMyReactionsByPostIds([ postId ])
}

export const useFetchMyReactionsByPostIds = (postIds: PostId[]) => {
  const myAddress = useMyAddress()
  return useFetch(
    fetchMyReactionsByPostIds,
    { ids: postIds, myAddress }
  )
}

export const useCreateUpsertMyReaction = () => {
  const myAddress = useMyAddress()
  return useActions<ReactionStruct>(({ dispatch, args: { id: postId, reactionId, kind } }) => {
    myAddress && dispatch(upsertMyReaction({
      id: prependPostIdWithMyAddress(postId, myAddress),
      reactionId,
      kind
    }))
  })
}