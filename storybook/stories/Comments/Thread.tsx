//////////////////////////////////////////////////////////////////////
// Thread of comments - uses base Comment
// TODO: Show parent comments above active comment, similar to Twitter
import React, { useCallback } from 'react'
import { StyleProp, StyleSheet, View, ViewStyle, ScrollView } from 'react-native'
import { useSelectPost, useSelectReplyIds, useSelectReplyTrail } from 'src/rtk/app/hooks'
import { useAppDispatch } from 'src/rtk/app/hooksCommon'
import { AccountId, PostId } from 'src/types/subsocial'
import { useInit } from '~comps/hooks'
import { useSubsocial } from '~comps/SubsocialContext'
import { Comment } from './Comment'
import { Opt } from 'src/types'
import { fetchPost, fetchPostReplyIds, replaceReply } from 'src/rtk/app/actions'
import { SpanningActivityIndicator } from '~comps/SpanningActivityIndicator'
import { Text } from '~comps/Typography'
import { useNavigation } from '@react-navigation/native'
import { ExploreStackNavigationProp } from '~comps/ExploreStackNav'
import { Replies } from './Replies'

export type CommentThreadProps = {
  id: Opt<PostId>
  preview?: boolean
  hideTrail?: boolean
  containerStyle?: StyleProp<ViewStyle>
  threadStyle?: StyleProp<ViewStyle>
  replyStyle?: StyleProp<ViewStyle>
  active?: boolean
  onReply?: (replyId: PostId) => void
  onPressReply?: (replyId: PostId) => void
  onPressProfile?: (accountId: AccountId) => void
  scrollTo?: ScrollView['scrollTo']
}
export function CommentThread({
  id,
  preview,
  hideTrail,
  containerStyle,
  threadStyle,
  replyStyle,
  active,
  onReply: _onReply,
  onPressReply: _onPressReply,
  onPressProfile: _onPressProfile,
  scrollTo,
}: CommentThreadProps) {
  const { api } = useSubsocial()
  const dispatch = useAppDispatch()
  const post = useSelectPost(id)
  const replies = useSelectReplyIds(id)
  const trail = useSelectReplyTrail(id)
  const nav = useNavigation<Opt<ExploreStackNavigationProp>>()
  const navigate = active ? nav?.replace : nav?.push
  const [ offsetY, setOffsetY ] = React.useState<Opt<number>>(undefined)
  
  const onReply = useCallback((id: PostId) => {
    if (_onReply) {
      _onReply(id)
    }
    else {
      navigate?.('Comment', { commentId: id, reply: true })
    }
  }, [ _onReply, navigate ])
  
  const onPressReply = useCallback((id: PostId) => {
    if (_onPressReply) {
      _onPressReply(id)
    }
    else {
      navigate?.('Comment', { commentId: id })
    }
  }, [ _onPressReply, navigate ])
  
  const onPressProfile = useCallback((id: AccountId) => {
    if (_onPressProfile) {
      _onPressProfile(id)
    }
    else {
      nav?.push?.('Account', { accountId: id })
    }
  }, [ _onPressProfile ])
  
  const postLoaded = useInit(async () => {
    if (!id || post) return true
    
    await dispatch(fetchPost({ api, id }))
    return true
  }, [ id ], [])
  
  const repliesLoaded = useInit(async () => {
    if (!id || replies.length) return true
    
    await dispatch(fetchPostReplyIds({ api, id }))
    return true
  }, [ id ], [])
  
  useInit(() => {
    if (!scrollTo || typeof offsetY === 'undefined') return false
    
    console.log(offsetY)
    scrollTo({ y: offsetY, animated: false })
    return true
  }, [ id ], [ scrollTo, offsetY ])
  
  if (!postLoaded || !repliesLoaded) {
    return (
      <View style={styles.noid}>
        <SpanningActivityIndicator />
      </View>
    )
  }
  
  else if (!id || !post) {
    return (
      <View style={styles.noid}>
        <Text style={styles.notfound}>Comment not found.</Text>
      </View>
    )
  }
  
  else {
    return (
      <View style={[styles.container, containerStyle]}>
        {!hideTrail && <Replies
          replies={trail}
          onReply={onReply}
          onPressReply={onPressReply}
          onPressProfile={onPressProfile}
        />}
        <Comment
          id={id}
          preview={preview}
          onPressProfile={onPressProfile}
          onPressMore={active ? undefined : (() => onPressReply(id))}
          onLayout={evt => setOffsetY(evt.nativeEvent.layout.y)}
          active={active}
        />
        <Replies
          replies={replies}
          containerStyle={[styles.thread, threadStyle]}
          replyStyle={replyStyle}
          onReply={onReply}
          onPressReply={onPressReply}
          onPressProfile={onPressProfile}
        />
      </View>
    )
  }
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  noid: {
    height: 120,
    alignItems: 'center',
    justifyContent: 'center',
  },
  thread: {
    paddingLeft: 40,
  },
  notfound: {
    fontStyle: 'italic',
  },
})
