import React from 'react'
import { storiesOf } from '@storybook/react-native'
import Welcome from './index'
import { SubsocialProvider } from '~comps/SubsocialContext'

storiesOf('Welcome', module)
  // using SubsocialProvider here ensures the screen is only schown when Subsocial is ready
  .add('to Storybook', () => <SubsocialProvider><Welcome /></SubsocialProvider>)
