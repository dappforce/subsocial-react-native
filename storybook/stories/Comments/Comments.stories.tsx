import React from 'react'
import { StyleSheet } from 'react-native'
import { storiesOf } from '@storybook/react-native'
import { action } from '@storybook/addon-actions'
import { boolean, number } from '@storybook/addon-knobs'
import { SubsocialProvider } from '~comps/SubsocialContext'
import CenterView from '../CenterView'
import { Comment } from './Comment'
import { CommentThread } from './Thread'
import { Divider } from '~comps/Typography'

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
  .add('Thread', () => (
    <CenterView>
      <CommentThread
        id={number('Root Comment ID 1', 21513) + ''}
        preview={boolean('Preview', true)}
        containerStyle={styles.thread}
      />
      <Divider />
      <CommentThread
        id={number('Root Comment ID 2', 21514) + ''}
        preview={boolean('Preview', true)}
        containerStyle={styles.thread}
      />
    </CenterView>
  ))

const styles = StyleSheet.create({
  padded: {
    padding: 20,
  },
  thread: {
    paddingHorizontal: 20,
    paddingTop: 10,
  },
})
