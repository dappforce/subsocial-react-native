import React from 'react'
import { storiesOf } from '@storybook/react-native'
import { LatestPosts } from './LatestPosts'
import { DotsamaSpaces } from './DotsamaSpaces'
import { SubsocialProvider } from '~comps/SubsocialContext'

storiesOf('Pages', module)
  .addDecorator(getStories => <SubsocialProvider>{getStories()}</SubsocialProvider>)
  .add('Latest Posts', () => <LatestPosts />)
  .add('Dotsama Spaces', () => <DotsamaSpaces />)
