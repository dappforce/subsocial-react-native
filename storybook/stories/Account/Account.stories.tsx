import React from 'react'
import { StyleSheet } from 'react-native'
import { storiesOf } from '@storybook/react-native'
import { text } from '@storybook/addon-knobs'
import CenterView from '~stories/CenterView'
import * as Account from './index'
import { SubsocialProvider } from 'src/components/SubsocialContext'

storiesOf('Accounts', module)
  .addDecorator(getStory => (
    <SubsocialProvider>
      {getStory()}
    </SubsocialProvider>
  ))
  .add('Preview', () => (
    <CenterView style={styles.padded}>
      <Account.Preview
        id={text('Address', '3rzZpUCan9uAA9VSH12zX552Y6rfemGR3hWeeLmhNT1EGosL')}
      />
    </CenterView>
  ))
  .add('Details', () => (
    <Account.Details
      id={text('Address', '3rzZpUCan9uAA9VSH12zX552Y6rfemGR3hWeeLmhNT1EGosL')}
    />
  ))
  .add('Address', () => (
    <CenterView style={styles.padded}>
      <Account.Address
        id={text('Address', '3rzZpUCan9uAA9VSH12zX552Y6rfemGR3hWeeLmhNT1EGosL')}
      />
    </CenterView>
  ))

const styles = StyleSheet.create({
  padded: {
    padding: 10,
  },
})
