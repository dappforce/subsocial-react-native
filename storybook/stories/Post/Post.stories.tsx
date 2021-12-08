import React from 'react'
import { ScrollView, StyleSheet } from 'react-native'
import { action } from '@storybook/addon-actions'
import { number } from '@storybook/addon-knobs'
import { storiesOf } from '@storybook/react-native'
import { Preview, Details } from './index'
import { SubsocialProvider } from '~comps/SubsocialContext'
import { ExploreStackNav } from '~comps/ExploreStackNav'

storiesOf('Post', module)
  .addDecorator((getStory) => (
    <SubsocialProvider>
      {getStory()}
    </SubsocialProvider>
  ))
  .add('Preview', () => (
    <ScrollView>
      <Preview
        id={number('Post ID', 20738)+''} // another good PostID is 20482
        onPressMore={action('pressMore')}
        onPressOwner={action('pressOwner')}
        onPressSpace={action('pressSpace')}
        onPressLike={action('pressLike')}
        onLike={action('onLike')}
        onUnlike={action('onUnlike')}
      />
    </ScrollView>
  ))
  .add('Details', () => (
    <Details
      id={number('Post ID', 20738)+''}
      containerStyle={styles.padded}
      onPressOwner={action('pressOwner')}
      onPressSpace={action('pressSpace')}
      onPressLike={action('pressLike')}
      onLike={action('onLike')}
      onUnlike={action('onUnlike')}
      onPressShare={action('pressShare')}
      onShare={action('onShare')}
      onPressReply={action('pressReply')}
      onPressReplyOwner={action('pressReplyOwner')}
    />
  ))
  .add('With Comments', () => (
    <ExploreStackNav title="Post">
      {() => <Details
        id={number('Post ID', 21437)+''}
        containerStyle={styles.padded}
      />}
    </ExploreStackNav>
  ))

const styles = StyleSheet.create({
  padded: {
    padding: 20,
  },
})
