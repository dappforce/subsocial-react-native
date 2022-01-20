import React, { useEffect, useState } from 'react'
import { ScrollView, StyleSheet } from 'react-native'
import { storiesOf } from '@storybook/react-native'
import { action } from '@storybook/addon-actions'
import { boolean, number } from '@storybook/addon-knobs'
import { SubsocialProvider, useSubsocial } from '~comps/SubsocialContext'
import CenterView from '../CenterView'
import { Comment } from './Comment'
import { CommentThread } from './Thread'
import { Divider } from '~comps/Typography'
import { PostId } from '@subsocial/api/flat-subsocial/dto'
import { useAppDispatch } from 'src/rtk/app/hooksCommon'
import { fetchPosts } from 'src/rtk/features/posts/postsSlice'
import { fetchPostReplyIds } from 'src/rtk/features/replies/repliesSlice'

storiesOf('Comments', module)
  .addDecorator(getStory => (
    <SubsocialProvider>
      {getStory()}
    </SubsocialProvider>
  ))
  .add('Comment', () => (
    <CenterView style={styles.padded}>
      <Comment
        id={number('id', 23427) + ''}
        onPressMore={action('onPressMore')}
        onPressProfile={action('onPressProfile')}
        preview={boolean('Preview', true)}
      />
    </CenterView>
  ))
  .add('Thread', () => <ThreadStory />)

function ThreadStory({}: {}) {
  const [ scrollRef, setScrollRef ] = useState<ScrollView | null>(null)
  
  return (
    <ScrollView ref={setScrollRef}>
      <CommentLoader comments={[ '21515', '21516', '21519' ]} />
      <CommentThread
        id={number('Root Comment ID 1', 21520) + ''}
        preview={boolean('Preview', true)}
        containerStyle={styles.thread}
        onPressReply={action('onPressReply')}
        onPressProfile={action('onPressProfile')}
        hideTrail={boolean('Hide Trail', false)}
        scrollTo={scrollRef?.scrollTo}
        />
      <Divider />
      <CommentThread
        id={number('Root Comment ID 2', 21514) + ''}
        preview={boolean('Preview', true)}
        containerStyle={styles.thread}
        onPressReply={action('onPressReply')}
        onPressProfile={action('onPressProfile')}
      />
    </ScrollView>
  )
}

type CommentLoaderProps = {
  comments: PostId[]
}
function CommentLoader({ comments }: CommentLoaderProps) {
  const { api } = useSubsocial()
  const dispatch = useAppDispatch()
  
  useEffect(() => {
    dispatch(fetchPosts({ api, ids: comments }))
    comments.forEach( id => dispatch(fetchPostReplyIds({ api, id }) ))
  }, [ comments ])
  
  return null
}

const styles = StyleSheet.create({
  padded: {
    padding: 20,
  },
  thread: {
    paddingHorizontal: 20,
    paddingTop: 10,
  },
})
