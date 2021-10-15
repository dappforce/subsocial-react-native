import React from 'react'
import { storiesOf } from '@storybook/react-native'
import { boolean, text } from '@storybook/addon-knobs'
import CenterView from '~stories/CenterView'
import * as Account from './index'
import { SubsocialProvider } from '~src/components/SubsocialContext'

storiesOf('Accounts', module)
  .addDecorator(getStory => (
    <SubsocialProvider>
      <CenterView>{getStory()}</CenterView>
    </SubsocialProvider>
  ))
  .add('Preview', () => (
    <Account.Preview
      id={text('Address', '3pgitDi6cc989ALL6vTEodUT1Zc4H86TK32Ev8gSVdiTYuZe')}
      preview={boolean('Preview', false)}
    />
  ))
