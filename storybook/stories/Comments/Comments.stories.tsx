import React from 'react'
import { StyleSheet } from 'react-native'
import { storiesOf } from '@storybook/react-native'
import { action } from '@storybook/addon-actions'
import { boolean, number } from '@storybook/addon-knobs'
import { SubsocialProvider } from '~comps/SubsocialContext'
import CenterView from '../CenterView'
import { Comment } from './Comment'
import { RawCommentThread } from './Thread'
import { Text } from '~comps/Typography'
import { DummyThreadData } from './DummyData'

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
    <CenterView style={styles.padded}>
      <Text>Note: These comments are fabricated for testing purposes!</Text>
      <RawCommentThread
        parent={DummyThreadData.parentComment}
        replies={DummyThreadData.replies}
        profiles={DummyThreadData.profiles}
        containerStyle={{ padding: 20 }}
      />
    </CenterView>
  ))

const styles = StyleSheet.create({
  padded: {
    padding: 20,
  },
})
