import React from 'react'
import { storiesOf } from '@storybook/react-native'
import { SubsocialProvider } from '~comps/SubsocialContext'
import { MainScreen } from './MainScreen'
import { ExploreScreen } from './ExploreScreen'
import { MyAccountDetails } from '../Account/MyAccountDetails'
import { KeyboardAdjustedView } from '~comps/KeyboardAdjustedView'

storiesOf('Screens', module)
  .addDecorator(getStories => <SubsocialProvider>{getStories()}</SubsocialProvider>)
  .add('Main Menu', () => (
    <KeyboardAdjustedView>
      <MainScreen />
    </KeyboardAdjustedView>
  ))
  .add('Explore', () => (
    <ExploreScreen />
  ))
  .add('My Profile', () => (
    <MyAccountDetails />
  ))
