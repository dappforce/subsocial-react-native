//////////////////////////////////////////////////////////////////////
// Miscellaneous small components & stories
import React from 'react'
import { ScrollView, StyleSheet } from 'react-native'
import { storiesOf } from '@storybook/react-native'
import { array, boolean, number, text } from '@storybook/addon-knobs'
import { action } from '@storybook/addon-actions'
import { SubsocialProvider } from '~comps/SubsocialContext'
import { Balance, SocialLinks, Tags } from './index'
import CenterView from '~stories/CenterView'
import { Markdown } from './Markdown'

storiesOf('Misc', module)
  .add('Tags', () => (
    <Tags
      tags={array('tags', ['foo', 'bar', 'baz'])}
      accented={boolean('accented', false)}
      onPress={action('onPress')}
    />
  ))
  .add('Socials', () => (
    <CenterView style={styles.padded}>
      <SocialLinks
        links={array('Links', ['twitter.com/SubsocialChain', 'twitter.com/Subsocial'])}
        onPress={action('onPress')}
        color={text('Color', '')}
        rtl={boolean('Right to Left', false)}
      />
    </CenterView>
  ))
  .add('Markdown', () => (
    <ScrollView style={styles.padded}>
      <Markdown
        summary={boolean('Summary', false)}
        mergeStyle={boolean('Merge Style', false)}
        onPressMore={action('onPressMore')}
      >
        {require('assets/example.md.js')}
      </Markdown>
    </ScrollView>
  ))
  .add('Balance', () => (
    <SubsocialProvider>
      <CenterView style={styles.padded}>
        <Balance
          address={text('Address', '3tZSKKfn9PSrLXTxExZtnhvV1oFyTjnF1P5pAnVyrdVs4h2v')}
          decimals={number('Decimals', 11)}
          truncate={number('Truncate', 11)}
          currency={text('Currency', 'SUB')}
        />
      </CenterView>
    </SubsocialProvider>
  ))


const styles = StyleSheet.create({
  padded: {
    padding: 10,
  },
})
