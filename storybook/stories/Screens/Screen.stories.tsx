import React from 'react'
import { storiesOf } from '@storybook/react-native'
import { SubsocialProvider } from '~comps/SubsocialContext'
import { SuperStackNav } from '~comps/SuperStackNav'
import { MainScreen } from './MainScreen'
import { ExploreScreen } from './ExploreScreen'

storiesOf('Screens', module)
  .addDecorator(getStories => <SubsocialProvider>{getStories()}</SubsocialProvider>)
  .add('Main Menu', () => (
    <SuperStackNav ExploreComponent={MainScreen} />
  ))
  .add('Explore', () => (
    <SuperStackNav ExploreComponent={ExploreScreen} />
  ))
