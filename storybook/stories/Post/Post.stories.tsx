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
  .add('Overview', () => (
    <CenterView>
      <Post id={20459} summary />
    </CenterView>
  ))
  .add('Long', () => (
    <ScrollView>
      <Post id={20459} />
    </ScrollView>
  ))
  .add('Short', () => (
    <ScrollView>
      <Post id={20482} />
    </ScrollView>
  ))
