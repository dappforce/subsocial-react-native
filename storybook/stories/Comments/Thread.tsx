//////////////////////////////////////////////////////////////////////
// Thread of comments - uses base Comment
// TODO: Show parent comments above active comment, similar to Twitter
import React from 'react'
import { StyleProp, StyleSheet, View, ViewStyle } from 'react-native'
import { shallowEqual } from 'react-redux'
import { useSelectPost } from 'src/rtk/app/hooks'
import { useAppDispatch, useAppSelector } from 'src/rtk/app/hooksCommon'
import { PostId } from 'src/types/subsocial'
import { useInit } from '~comps/hooks'
import { useSubsocial } from '~comps/SubsocialContext'
import { Comment } from './Comment'
import { Opt } from 'src/types'
import { fetchPostReplyIds, selectReplyIds } from 'src/rtk/features/replies/repliesSlice'
import { fetchPost } from 'src/rtk/features/posts/postsSlice'
import { SpanningActivityIndicator } from '~comps/SpanningActivityIndicator'
import { Text } from '~comps/Typography'

export type CommentThreadProps = {
  id: Opt<PostId>
  preview?: boolean
  containerStyle?: StyleProp<ViewStyle>
  threadStyle?: StyleProp<ViewStyle>
  replyStyle?: StyleProp<ViewStyle>
}
export function CommentThread({ id, preview, containerStyle, threadStyle, replyStyle }: CommentThreadProps) {
  const { api } = useSubsocial()
  const dispatch = useAppDispatch()
  const post = useSelectPost(id)
  const replies = useAppSelector<PostId[]>(
    state => id && selectReplyIds(state, id)?.replyIds || [],
    shallowEqual
  )
  
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
        <Comment id={id} preview={preview} />
        <View style={[styles.thread, threadStyle]}>
          {replies.map(id => <Comment id={id} key={id} containerStyle={replyStyle} preview={preview} />)}
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
