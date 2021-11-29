//////////////////////////////////////////////////////////////////////
// Specialized action panel share item for posts
import React, { useCallback } from 'react'
import { Share } from 'react-native'
import { createPostSlug, HasTitleOrBody } from '@subsocial/utils/slugify'
import { Panel } from '../Actions/Panel'
import { PostId } from 'src/types/subsocial'
import { useSelectPost, useSelectSpace } from 'src/rtk/app/hooks'
import Constants from 'expo-constants'

export class SharePostEvent {
  #_isDefaultPrevented = false
  
  constructor (public readonly postId: PostId) {}
  
  preventDefault() {
    this.#_isDefaultPrevented = true
  }
  
  get isDefaultPrevented() {
    return this.#_isDefaultPrevented
  }
}

export type SharePostActionProps = {
  postId: PostId
  onPress?: (e: SharePostEvent) => void | Promise<void>
  onShare?: (e: SharePostEvent) => void | Promise<void>
}

export function SharePostAction({ postId, onPress: _onPress, onShare }: SharePostActionProps) {
  const data = useSelectPost(postId)
  const space = useSelectSpace(data?.post.struct.spaceId)
  
  const onPress = useCallback(async () => {
    const evt = new SharePostEvent(postId)
    await _onPress?.(evt)
    
    if (!evt.isDefaultPrevented) {
      const url = makePostUrl(space?.struct.handle, postId, data?.post.content)
      
      if (Constants.platform?.ios) {
        await Share.share({
          message: 'Check out this post on Subsocial!',
          url,
        })
      }
      else {
        await Share.share({ message: `Check out this post on Subsocial! ${makePostUrl(space?.struct.handle, postId, data?.post.content)}`})
      }
      
      await onShare?.(evt)
    }
  }, [ postId, space?.struct.handle ])
  
  return (
    <Panel.ShareItem
      onPress={onPress}
      label={data?.post.struct.sharesCount}
      disabled={!space?.struct.handle}
    />
  )
}

function makePostUrl(spaceHandle: undefined | string, postId: PostId, content: HasTitleOrBody | undefined) {
  if (!spaceHandle || !content) throw new Error('Space handle or post content undefined')
  return `https://app.subsocial.network/@${spaceHandle}/${createPostSlug(postId, content)}`
}
