import { useActions } from 'src/rtk/app/helpers'
import { useAppSelector } from 'src/rtk/app/hooksCommon'
import { asCommentStruct, PostId, PostStruct, PostWithSomeDetails } from 'src/types/subsocial'
import {
  fetchPosts,
  SelectPostArgs,
  SelectPostsArgs,
  selectPostStructById,
  upsertPost
} from './postsSlice'
import { selectPostContentById } from '../contents/contentsSlice'
import { useSelectSpace } from '../spaces/spacesHooks'

export const useSelectPost = (postId?: PostId): PostWithSomeDetails | undefined => {
  const struct = useAppSelector(state => postId
    ? selectPostStructById(state, postId)
    : undefined
  )
  
  const cid = struct?.contentId
  const content = useAppSelector(state => cid
    ? selectPostContentById(state, cid)
    : undefined
  )
  
  const rootPostStruct = useAppSelector(state => struct && struct.isComment
    ? selectPostStructById(state, asCommentStruct(struct).rootPostId)
    : undefined)
  
  const spaceId = struct?.spaceId || rootPostStruct?.spaceId
  const space = useSelectSpace(spaceId)
  
  if (!struct || !content) return undefined
  
  const id = struct.id
  
  return {
    id,
    post: {
      id,
      struct,
      content,
    },
    space,
  }
}

export const useCreateReloadPosts = () => {
  return useActions<SelectPostsArgs>(({ dispatch, api, args: { ids, reload } }) => {
    return dispatch(fetchPosts({ api, ids, reload }))
  })
}

export const useCreateReloadPost = () => {
  return useActions<SelectPostArgs>(({ dispatch, api, args: { id, reload } }) => {
    return dispatch(fetchPosts({ api, ids: [ id ], reload }))
  })
}

export const useCreateUpsertPost = () => {
  return useActions<PostStruct>(({ dispatch, args }) => {
    return dispatch(upsertPost(args))
  })
}
