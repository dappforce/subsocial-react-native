import React from 'react'
import { ScrollView } from 'react-native'
import { action } from '@storybook/addon-actions'
import { text } from '@storybook/addon-knobs'
import { storiesOf } from '@storybook/react-native'
import Post from './index'
import { SubsocialProvider } from '~comps/SubsocialContext'
import CenterView from '../CenterView'

storiesOf('Post', module)
  .addDecorator((getStory) => (
    <SubsocialProvider>
      {getStory()}
    </SubsocialProvider>
  ))
  .add('overview', () => (
    <CenterView>
      <Post id={20459} summary />
    </CenterView>
  ))
  .add('long', () => (
    <ScrollView>
      <Post id={20459} />
    </ScrollView>
  ))
  .add('short', () => (
    <ScrollView>
      <Post id={20482} />
    </ScrollView>
  ))
