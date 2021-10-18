import React from 'react'
import { StyleSheet, View } from 'react-native'
import { action } from '@storybook/addon-actions'
import { array, boolean, text } from '@storybook/addon-knobs'
import { storiesOf } from '@storybook/react-native'
import * as Space from './index'
import { SubsocialProvider } from '~comps/SubsocialContext'
import CenterView from '../CenterView'

storiesOf('Space', module)
  .addDecorator((getStory) => (
    <SubsocialProvider>{getStory()}</SubsocialProvider>
  ))
  .add('Summary', () => (
    <CenterView style={styles.padded}>
      <Space.Summary
        id={text('handle', '@subsocial')}
        showFollowButton={boolean('Follow Button', true)}
        showAbout={boolean('About', true)}
        showSocials={boolean('Socials', true)}
        showTags={boolean('Tags', true)}
        preview={boolean('Preview', false)}
      />
    </CenterView>
  ))
  .add('Posts', () => (
    <Space.Posts id={text('handle', '@subsocial')} />
  ))
  .add('Explore (Preview)', () => (
    <Space.PreviewExplorer spaces={array('spaces', ['@subsocial', '@PolkaWarriors', '@PolkadotDigest', '@rmrkapp', '@DotMarketCap'])} />
  ))

const styles = StyleSheet.create({
  padded: {
    padding: 10,
  },
});
