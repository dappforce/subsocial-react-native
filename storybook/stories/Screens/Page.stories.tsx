import React from 'react'
import { storiesOf } from '@storybook/react-native'
import { DotsamaSpaces } from './DotsamaSpaces'
import { SubsocialProvider } from '~comps/SubsocialContext'
import { LatestPostsScreen } from './LatestPosts'

storiesOf('Pages', module)
  .addDecorator(getStories => <SubsocialProvider>{getStories()}</SubsocialProvider>)
  .add('Latest Posts', () => <LatestPostsScreen />)
  .add('Dotsama Spaces', () => <DotsamaSpaces />)
