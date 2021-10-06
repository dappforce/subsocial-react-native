import React from 'react'
import { Text } from 'react-native'
import { action } from '@storybook/addon-actions'
import { text } from '@storybook/addon-knobs'
import { storiesOf } from '@storybook/react-native'
import Post from './index'
import { SubstrateProvider, SubsocialProvider } from '../../../src/components/SubsocialContext'
import CenterView from '../CenterView'
import config from 'config.json'

storiesOf('Post', module)
  .addDecorator((getStory) => (
    <SubsocialProvider>
      <CenterView>
        {getStory()}
      </CenterView>
    </SubsocialProvider>
  ))
  .add('sample post', () => {
    return <Post id={20423} />
  })
