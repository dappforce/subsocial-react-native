import React from 'react'
import { ScrollView, StyleSheet } from 'react-native'
import { action } from '@storybook/addon-actions'
import { array, text } from '@storybook/addon-knobs'
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
      <Space.Summary id={text('handle', '@subsocial')} />
    </CenterView>
  ))
  .add('Overview', () => (
    <CenterView style={styles.padded}>
      <Space.Overview id={text('handle', '@subsocial')} />
    </CenterView>
  ))
  .add('Explore', () => (
    <ScrollView style={styles.padded}>
      <Space.PreviewExplorer spaces={array('spaces', ['@subsocial', '@PolkaWarriors', '@PolkadotDigest', '@rmrkapp', '@DotMarketCap'])} />
    </ScrollView>
  ))

const styles = StyleSheet.create({
  padded: {
    padding: 10,
  },
});
