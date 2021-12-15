//////////////////////////////////////////////////////////////////////
// Specialized action panel like item which automatically retrieves
// like count & like status
// -----
// Differs from Web App in that we only have likes, according to Figma
import React, { useCallback, useEffect, useState } from 'react'
import { shallowEqual, useStore } from 'react-redux'
import { useSelectKeypair, useSelectPost } from 'src/rtk/app/hooks'
import { useAppDispatch, useAppSelector } from 'src/rtk/app/hooksCommon'
import { useSubsocial } from '~comps/SubsocialContext'
import { RootState } from 'src/rtk/app/rootReducer'
import { fetchMyReactionsByPostIds, selectMyReactionsByPostIds } from 'src/rtk/features/reactions/myPostReactionsSlice'
import { setPrompt } from 'src/rtk/features/ui/uiSlice'
import { PostId } from 'src/types/subsocial'
import { Panel, PanelLikeItemProps } from '../Actions/Panel'
import { logger as createLogger } from '@polkadot/util'
import { ReactionKind } from '@subsocial/types/substrate/classes'
import * as tx from 'src/tx'

const log = createLogger('Post/Likes')
let loggedMultipleLikes = false

export class LikeEvent {
  #_isDefaultPrevented = false
  
  constructor(public readonly postId: PostId, public readonly isLiked: boolean) {}
  
  preventDefault() {
    this.#_isDefaultPrevented = true
  }
  
  get isDefaultPrevented() {
    return this.#_isDefaultPrevented
  }
}

export type LikeActionProps = Omit<PanelLikeItemProps, 'liked' | 'likesCount' | 'onPress'> & {
  postId: PostId
  onPress?: (event: LikeEvent) => void
  onLike?: (event: LikeEvent) => void
  onUnlike?: (event: LikeEvent) => void
}
export function LikeAction({ postId, onPress: _onPress, onLike, onUnlike, ...props }: LikeActionProps) {
  const { api } = useSubsocial()
  const store = useStore<RootState>()
  const dispatch = useAppDispatch()
  const keypair = useSelectKeypair()
  const reactions = useSelectMyLikes(postId)
  const liked = !!reactions.length
  const postData = useSelectPost(postId)
  
  if (reactions.length > 1 && !loggedMultipleLikes) {
    loggedMultipleLikes = true
    log.error(`Found more than 1 own likes (${reactions.length}) by ${keypair?.address} on post ${postId}`)
  }
  
  const onPress = useCallback(async () => {
    if (!keypair) {
      dispatch(setPrompt('login'))
    }
    else if (keypair.isLocked()) {
      dispatch(setPrompt('unlock'))
    }
    
    else {
      const evt = new LikeEvent(postId, liked)
      _onPress?.(evt)
      
      if (!evt.isDefaultPrevented) {
        const substrate = await api.substrate.api
        
        if (liked) {
          await tx.send({
            api: substrate,
            store,
            tx: 'reactions.deletePostReaction',
            args: [ postId, reactions[0].reactionId ],
          })
          onUnlike?.(evt)
        }
        else {
          await tx.send({
            api: substrate,
            store,
            tx: 'reactions.createPostReaction',
            args: [ postId, new ReactionKind('Upvote')],
          })
          onLike?.(evt)
        }
      }
    }
  }, [ api, postId, keypair, liked, _onPress, onLike, onUnlike ])
  
  useEffect(() => {
    dispatch(fetchMyReactionsByPostIds({ api, myAddress: keypair?.address, ids: [ postId ] }))
  }, [ keypair?.address ])
  
  return (
    <Panel.LikeItem
      {...props}
      liked={liked}
      likesCount={postData?.post.struct.upvotesCount ?? 0}
      onPress={onPress}
    />
  )
}


const useSelectMyLikes = (postId: PostId) => {
  const { address } = useSelectKeypair() ?? {}
  const allReactions = useAppSelector(state => selectMyReactionsByPostIds(state, { myAddress: address, ids: [ postId ]}), shallowEqual)
  
  return allReactions.filter(r => r.kind === 'Upvote')
}
