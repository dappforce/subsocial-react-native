import { useNavigation } from '@react-navigation/native'
import React, { useCallback } from 'react'
import { StyleProp, ViewStyle } from 'react-native'
import { useSelectPost } from 'src/rtk/app/hooks'
import { PostId } from 'src/types/subsocial'
import { assertDefined } from 'src/util/assert'
import { ExploreRoutes, ExploreStackNavigationProp } from '~comps/ExploreStackNav'
import { Panel } from '../Actions/Panel'

export type ReplyActionProps = {
  postId: PostId
  onPress?: () => void
  containerStyle?: StyleProp<ViewStyle>
}

export const ReplyAction = React.memo(({ postId, onPress: _onPress, ...props }: ReplyActionProps) => {
  const post = useSelectPost(postId)
  const nav = useNavigation<ExploreStackNavigationProp>()
  
  const onPress = useCallback(() => {
    assertDefined(post, 'no post data')
    
    if (_onPress) {
      _onPress()
    }
    else if (nav?.push) {
      if (post?.post.struct.isComment) {
        nav.push('Comment', { commentId: postId, reply: true })
      }
      else {
        nav.push('Post', { postId, reply: true })
      }
    }
  }, [ nav, postId, post ])
  
  return (
    <Panel.ReplyItem
      {...props}
      replyCount={post?.post.struct.visibleRepliesCount ?? 0}
      onPress={onPress}
    />
  )
})
