//////////////////////////////////////////////////////////////////////
// Thread of comments - uses base Comment
// TODO: Show parent comments above active comment, similar to Twitter
import React from 'react'
import { StyleProp, StyleSheet, View, ViewStyle } from 'react-native'
import { shallowEqual } from 'react-redux'
import { useSelectPost } from 'src/rtk/app/hooks'
import { useAppDispatch, useAppSelector } from 'src/rtk/app/hooksCommon'
import { AccountId, PostData, PostId, ProfileData } from 'src/types/subsocial'
import { useInit } from '~comps/hooks'
import { useSubsocial } from '~comps/SubsocialContext'
import { Comment, CommentData } from './Comment'
import { Opt } from 'src/types'
import { selectReplyIds } from 'src/rtk/features/replies/repliesSlice'
import { fetchPost, selectPosts } from 'src/rtk/features/posts/postsSlice'
import { SpanningActivityIndicator } from '~comps/SpanningActivityIndicator'
import { Text } from '~comps/Typography'

export type CommentThreadProps = Omit<RawCommentThreadProps, 'parent' | 'replies'> & {
  id: Opt<PostId>
}
export function CommentThread({ id, ...props }: CommentThreadProps) {
  const { api } = useSubsocial()
  const dispatch = useAppDispatch()
  const post = useSelectPost(id)
  const replyIds = useAppSelector<PostId[]>(
    state => id && selectReplyIds(state, id)?.replyIds || [],
    shallowEqual
  )
  const replies = useAppSelector<PostData[]>(state =>
    selectPosts(state, { ids: replyIds }).map(data => data.post),
    shallowEqual
  )
  
  useInit(async () => {
    if (!id) return true
    
    if (!post) {
      dispatch(fetchPost({ api, id }))
    }
    return true
  }, [ id ], [])
  
  if (!id) {
    return (
      <View style={styles.noid}>
        <SpanningActivityIndicator />
      </View>
    )
  }
  
  else if (!post) {
    <View style={styles.noid}>
      <Text style={styles.notfound}>Comment not found.</Text>
    </View>
  }
  
  else {
    return (
      <RawCommentThread
        {...props}
        parent={post.post}
        replies={replies}
      />
    )
  }
}

export type RawCommentThreadProps = {
  parent: PostData
  replies: PostData[]
  profiles: Record<AccountId, Opt<ProfileData>>
  containerStyle?: StyleProp<ViewStyle>
  threadStyle?: StyleProp<ViewStyle>
  replyStyle?: StyleProp<ViewStyle>
}
export function RawCommentThread({ parent, replies, profiles, containerStyle, threadStyle, replyStyle }: RawCommentThreadProps) {
  return (
    <View style={[styles.container, containerStyle]}>
      <CommentData post={parent} profile={profiles[parent.struct.ownerId]} />
      <View style={[styles.thread, threadStyle]}>
        {replies.map(reply => <CommentData post={reply} profile={profiles[reply.struct.ownerId]} key={reply.id} containerStyle={replyStyle} />)}
      </View>
    </View>
  )
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
