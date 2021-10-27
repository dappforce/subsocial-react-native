import React from 'react'
import { storiesOf } from '@storybook/react-native'
import { SubsocialProvider } from '~comps/SubsocialContext'
import { SuperStackNav } from '~comps/SuperStackNav'
import { ExploreScreen } from './ExploreScreen'

storiesOf('Screens', module)
  .addDecorator(getStories => <SubsocialProvider>{getStories()}</SubsocialProvider>)
  .add('Explore', () => (
    <SuperStackNav ExploreComponent={ExploreScreen} />
  ))
