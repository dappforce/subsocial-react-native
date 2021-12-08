import React from 'react'
import { StyleProp, View, ViewStyle } from 'react-native'
import { Comment } from './Comment'
import { AccountId, PostId } from '@subsocial/api/flat-subsocial/dto'

export type RepliesProps = {
  replies: PostId[]
  preview?: boolean
  containerStyle?: StyleProp<ViewStyle>
  replyStyle?: StyleProp<ViewStyle>
  onPressReply?: (replyId: PostId) => void
  onPressProfile?: (accountId: AccountId) => void
}

export const Replies = React.memo(({
  replies,
  preview,
  containerStyle,
  replyStyle,
  onPressReply,
  onPressProfile,
}: RepliesProps) => {
  return (
    <View style={containerStyle}>
      {replies.map(id => (
        <Comment
          id={id}
          key={id}
          containerStyle={replyStyle}
          preview={preview}
          onPressMore={() => onPressReply?.(id)}
          onPressProfile={onPressProfile}
        />
      ))}
    </View>
  )
})
