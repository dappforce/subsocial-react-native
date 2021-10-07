//////////////////////////////////////////////////////////////////////
// Stories for standardized SubsocialText component
// SPDX-License-Identifier: GPL-3.0
import React from 'react'
import { StyleSheet } from 'react-native'
import { storiesOf } from '@storybook/react-native'
import SubsocialText from './index'
import CenterView from '../CenterView'

storiesOf('Subsocial Text', module)
  .addDecorator(getStories => <CenterView>{getStories()}</CenterView>)
  .add('Color Scheme', () => (
    <>
      <SubsocialText style={styles.italic}>italic</SubsocialText>
      <SubsocialText style={styles.bold}>bold</SubsocialText>
      <SubsocialText style={styles.underline}>underline</SubsocialText>
      <SubsocialText style={styles.strikethru}>strikethru</SubsocialText>
    </>
  ))

const styles = StyleSheet.create({
  italic: {
    fontStyle: 'italic',
  },
  bold: {
    fontWeight: 'bold',
  },
  underline: {
    textDecorationLine: 'underline',
  },
  strikethru: {
    textDecorationLine: 'line-through',
  },
});
