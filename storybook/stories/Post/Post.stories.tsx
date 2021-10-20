import React from 'react'
import { ScrollView } from 'react-native'
import { action } from '@storybook/addon-actions'
import { number } from '@storybook/addon-knobs'
import { storiesOf } from '@storybook/react-native'
import { Preview } from './index'
import { SubsocialProvider } from '~comps/SubsocialContext'

storiesOf('Post', module)
  .addDecorator((getStory) => (
    <SubsocialProvider>
      {getStory()}
    </SubsocialProvider>
  ))
  .add('Preview', () => (
    <ScrollView>
      <Preview
        id={number('Post ID', 20738)+''} // another good PostID is 20482
        onPressMore={action('pressMore')}
      />
    </ScrollView>
  ))
