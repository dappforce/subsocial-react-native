import React from 'react'
import { ScrollView } from 'react-native'
import { action } from '@storybook/addon-actions'
import { number, boolean } from '@storybook/addon-knobs'
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
  .add('Long', () => (
    <ScrollView>
      <Post id={number('Post ID', 20459)} preview={boolean('Preview?', false)} />
    </ScrollView>
  ))
  .add('Short', () => (
    <ScrollView>
      <Post id={number('Post ID', 20482)} preview={boolean('Preview?', false)} />
    </ScrollView>
  ))
