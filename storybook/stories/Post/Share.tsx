//////////////////////////////////////////////////////////////////////
// Specialized action panel share item for posts
import React from 'react'
import { createPostSlug, HasTitleOrBody } from '@subsocial/utils/slugify'
import { Panel, PanelShareItemProps } from '../Actions/Panel'
import { CommentStruct, PostId } from 'src/types/subsocial'
import { useSelectPost, useSelectSpace } from 'src/rtk/app/hooks'
import { useInit } from '~comps/hooks'
import { useSubsocial } from '~comps/SubsocialContext'
import { useAppDispatch } from 'src/rtk/app/hooksCommon'
import { fetchPost } from 'src/rtk/features/posts/postsSlice'
import { fetchSpace } from 'src/rtk/features/spaces/spacesSlice'
import { Opt } from 'src/types'

export type SharePostActionProps = Omit<PanelShareItemProps, 'shareMessage' | 'shareUrl'> & {
  postId: PostId
}
export function SharePostAction({ postId, ...props }: SharePostActionProps) {
  const { api } = useSubsocial()
  const dispatch = useAppDispatch()
  const data = useSelectPost(postId)
  const rootId = (data?.post.struct as Opt<CommentStruct>)?.rootPostId
  const rootPost = useSelectPost(rootId?.toString())
  const spaceId = rootPost?.post.struct.spaceId
  const space = useSelectSpace(spaceId)
  
  useInit(async () => {
    if (!data) {
      dispatch(fetchPost({ api, id: postId }))
    }
    return true
  }, [ postId ], [])
  
  useInit(async () => {
    if (space) return true
    
    if (spaceId) {
      dispatch(fetchSpace({ api, id: spaceId, reload: false }))
    }
    return true
  }, [ spaceId ], [])
  
  useInit(async () => {
    if (rootId) {
      dispatch(fetchPost({ api, id: rootId, reload: false }))
    }
    return true
  }, [ rootId ], [])
  
  return (
    <Panel.ShareItem
      {...props}
      label={data?.post.struct.sharesCount}
      shareMessage={data?.post.struct.isComment ? 'Check out this comment on Subsocial!' : 'Check out this post on Subsocial!'}
      shareUrl={makePostUrl(space?.struct.handle, postId, data?.post.content)}
    />
  )
}

function makePostUrl(spaceHandle: undefined | string, postId: PostId, content: HasTitleOrBody | undefined) {
  spaceHandle = spaceHandle || 'subsocial'
  const page = content ? createPostSlug(postId, content) : postId
  return `https://app.subsocial.network/@${spaceHandle}/${page}`
}
