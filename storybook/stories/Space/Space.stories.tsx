import React from 'react'
import { StyleSheet } from 'react-native'
import { action } from '@storybook/addon-actions'
import { text } from '@storybook/addon-knobs'
import { storiesOf } from '@storybook/react-native'
import { SpaceSummary } from './index'
import { SubsocialProvider } from '~comps/SubsocialContext'
import CenterView from '../CenterView'

storiesOf('Space', module)
  .addDecorator((getStory) => (
    <SubsocialProvider>{getStory()}</SubsocialProvider>
  ))
  .add('summary', () => (
    <CenterView style={styles.spaced}>
      <SpaceSummary handle="@rmrkapp" />
    </CenterView>
  ))
  .add('overview', () => (
    <CenterView>
      {/* <SpaceOverview handle="@rmrkapp" /> */}
    </CenterView>
  ))

const styles = StyleSheet.create({
  spaced: {
    padding: 10,
  },
});
