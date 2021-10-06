import React from 'react'
import { action } from '@storybook/addon-actions'
import { text } from '@storybook/addon-knobs'
import { storiesOf } from '@storybook/react-native'
import Post from './index'
import { SubsocialProvider } from '../../../src/components/SubsocialContext'
import CenterView from '../CenterView'

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
