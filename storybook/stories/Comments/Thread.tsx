//////////////////////////////////////////////////////////////////////
// Thread of comments - uses base Comment
// TODO: Show parent comments above active comment, similar to Twitter
import React, { useCallback } from 'react'
import { StyleProp, StyleSheet, View, ViewStyle } from 'react-native'
import { shallowEqual } from 'react-redux'
import { useSelectPost } from 'src/rtk/app/hooks'
import { useAppDispatch, useAppSelector } from 'src/rtk/app/hooksCommon'
import { AccountId, PostId } from 'src/types/subsocial'
import { useInit } from '~comps/hooks'
import { useSubsocial } from '~comps/SubsocialContext'
import { Comment } from './Comment'
import { Opt } from 'src/types'
import { fetchPostReplyIds, selectReplyIds } from 'src/rtk/features/replies/repliesSlice'
import { fetchPost } from 'src/rtk/features/posts/postsSlice'
import { SpanningActivityIndicator } from '~comps/SpanningActivityIndicator'
import { Text } from '~comps/Typography'
import { useNavigation } from '@react-navigation/native'
import { ExploreStackNavigationProp } from '~comps/ExploreStackNav'

export type CommentThreadProps = {
  id: Opt<PostId>
  preview?: boolean
  containerStyle?: StyleProp<ViewStyle>
  threadStyle?: StyleProp<ViewStyle>
  replyStyle?: StyleProp<ViewStyle>
  onPressReply?: (replyId: PostId) => void
  onPressProfile?: (accountId: AccountId) => void
}
export function CommentThread({
  id,
  preview,
  containerStyle,
  threadStyle,
  replyStyle,
  onPressReply: _onPressReply,
  onPressProfile: _onPressProfile,
}: CommentThreadProps) {
  const { api } = useSubsocial()
  const dispatch = useAppDispatch()
  const post = useSelectPost(id)
  const replies = useAppSelector<PostId[]>(
    state => id && selectReplyIds(state, id)?.replyIds || [],
    shallowEqual
  )
  const nav = useNavigation<Opt<ExploreStackNavigationProp>>()
  
  const onPressReply = useCallback((id: PostId) => {
    if (_onPressReply) {
      _onPressReply(id)
    }
    else {
      nav?.push?.('Comment', { commentId: id })
    }
  }, [ _onPressReply ])
  
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
        <Comment
          id={id}
          preview={preview}
          onPressMore={() => onPressReply(id)}
          onPressProfile={onPressProfile}
        />
        <View style={[styles.thread, threadStyle]}>
          {replies.map(id => (
            <Comment
              id={id}
              key={id}
              containerStyle={replyStyle}
              preview={preview}
              onPressMore={() => onPressReply(id)}
              onPressProfile={onPressProfile}
            />
          ))}
        </View>
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
