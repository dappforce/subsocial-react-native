import React, { useState } from 'react'
import { StyleSheet } from 'react-native'
import { action } from '@storybook/addon-actions'
import { text } from '@storybook/addon-knobs'
import { storiesOf } from '@storybook/react-native'
import { TextInput } from 'react-native-paper'
import { SpaceOverview, SpaceSummary } from './index'
import { SubsocialProvider } from '~comps/SubsocialContext'
import CenterView from '../CenterView'

storiesOf('Space', module)
  .addDecorator((getStory) => (
    <SubsocialProvider>{getStory()}</SubsocialProvider>
  ))
  .add('summary', () => (
    <CenterView style={styles.padded}>
      <SpaceSummary handle={text('handle', '@subsocial')} />
    </CenterView>
  ))
  .add('overview', () => (
    <CenterView style={styles.padded}>
      <SpaceOverview handle={text('handle', '@subsocial')} />
    </CenterView>
  ))

const styles = StyleSheet.create({
  padded: {
    padding: 10,
  },
});
