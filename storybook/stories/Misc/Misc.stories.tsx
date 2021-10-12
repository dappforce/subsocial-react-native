//////////////////////////////////////////////////////////////////////
// Miscellaneous small components & stories
import React from 'react'
import CenterView from '~stories/CenterView'
import { storiesOf } from '@storybook/react-native'
import { array, boolean } from '@storybook/addon-knobs'
import { action } from '@storybook/addon-actions'
import { Tags, Socials } from './index'

storiesOf('Misc', module)
  .add('Tags', () => (
    <Tags
      tags={array('tags', ['foo', 'bar', 'baz'])}
      accented={boolean('accented', false)}
      onPress={action('onPress')}
    />
  ))
  .add('Socials', () => (
    <Socials
      links={array('links', ['twitter.com/Kiruse', 'twitter.com/Subsocial'])}
      onPress={action('onPress')}
    />
  ))
