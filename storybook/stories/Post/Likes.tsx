//////////////////////////////////////////////////////////////////////
// Specialized action panel like item which automatically retrieves
// like count & like status
// -----
// Differs from Web App in that we only have likes, according to Figma
import React, { useCallback, useEffect, useState } from 'react'
import { shallowEqual } from 'react-redux'
import { useSelectKeypair, useSelectPost } from 'src/rtk/app/hooks'
import { useAppSelector } from 'src/rtk/app/hooksCommon'
import { useSubsocial } from '~comps/SubsocialContext'
import { useFetchMyReactionsByPostId } from 'src/rtk/features/reactions/myPostReactionsHooks'
import { selectMyReactionsByPostIds } from 'src/rtk/features/reactions/myPostReactionsSlice'
import { PostId } from 'src/types/subsocial'
import { Panel } from '../Actions/Panel'
import { LoginPrompt } from '~stories/Actions'
import * as tx from 'src/tx'
import { logger as createLogger } from '@polkadot/util'
import { ReactionKind } from '@subsocial/types/substrate/classes'

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

export type LikeActionProps = {
  postId: PostId
  onPress?: (event: LikeEvent) => void
  onLike?: (event: LikeEvent) => void
  onUnlike?: (event: LikeEvent) => void
}
export function LikeAction({ postId, onPress: _onPress, onLike, onUnlike }: LikeActionProps) {
  useFetchMyReactionsByPostId(postId)
  
  const { api } = useSubsocial()
  const keypair = useSelectKeypair()
  const reactions = useSelectMyLikes(postId)
  const liked = !!reactions.length
  const postData = useSelectPost(postId)
  const [ showLoginPrompt, setShowLoginPrompt ] = useState(false)
  
  if (reactions.length > 1 && !loggedMultipleLikes) {
    loggedMultipleLikes = true
    log.error(`Found more than 1 own likes (${reactions.length}) by ${keypair?.address} on post ${postId}`)
  }
  
  const onPress = useCallback(async () => {
    if (!keypair) {
      setShowLoginPrompt(true)
    }
    
    else {
      const evt = new LikeEvent(postId, liked)
      _onPress?.(evt)
      
      if (!evt.isDefaultPrevented) {
        const substrate = await api.substrate.api
        
        if (liked) {
          await tx.send({
            api: substrate,
            tx: 'reactions.deletePostReaction',
            args: [ postId, reactions[0].reactionId ],
          })
          onUnlike?.(evt)
        }
        else {
          await tx.send({
            api: substrate,
            tx: 'reactions.createPostReaction',
            args: [ postId, new ReactionKind('Upvote')],
          })
          onLike?.(evt)
        }
      }
    }
  }, [ api, postId, keypair, liked, _onPress, onLike, onUnlike, setShowLoginPrompt ])
  
  return (
    <>
      <Panel.LikeItem
        liked={liked}
        likesCount={postData?.post.struct.upvotesCount ?? 0}
        onPress={onPress}
      />
      {showLoginPrompt && <LoginPrompt visible onClose={() => setShowLoginPrompt(false)} />}
    </>
  )
}


const useSelectMyLikes = (postId: PostId) => {
  const { address } = useSelectKeypair() ?? {}
  const allReactions = useAppSelector(state => selectMyReactionsByPostIds(state, { myAddress: address, ids: [ postId ]}), shallowEqual)
  
  return allReactions.filter(r => r.kind === 'Upvote')
}
