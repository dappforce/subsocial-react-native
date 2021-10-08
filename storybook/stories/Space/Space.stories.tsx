import React from 'react'
import { action } from '@storybook/addon-actions'
import { text } from '@storybook/addon-knobs'
import { storiesOf } from '@storybook/react-native'
import { SpaceSummary } from './index'
import { SubsocialProvider } from '~comps/SubsocialContext'
import CenterView from '../CenterView'

storiesOf('Space', module)
  .addDecorator((getStory) => <SubsocialProvider><CenterView>{getStory()}</CenterView></SubsocialProvider>)
  .add('space overview', () => (
    <SpaceSummary handle="@rmrkapp" />
  ))
