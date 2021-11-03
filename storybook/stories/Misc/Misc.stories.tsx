//////////////////////////////////////////////////////////////////////
// Miscellaneous small components & stories
import React from 'react'
import CenterView from '~stories/CenterView'
import { storiesOf } from '@storybook/react-native'
import { array, boolean, number, text } from '@storybook/addon-knobs'
import { action } from '@storybook/addon-actions'
import { SubsocialProvider } from '~comps/SubsocialContext'
import { Balance, Modal, SocialLinks, Tags } from './index'
import { Button, Text } from '~comps/Typography'
import QRCode from 'react-native-qrcode-svg'

function ModalStory() {
  const [visible, setVisible] = React.useState(false)
  const onRequestClose = () => setVisible(false)
  
  return (
    <CenterView style={{padding: 10}}>
      <Button onPress={() => setVisible(true)}>Show Modal</Button>
      <Modal
        {...{visible, onRequestClose}}
        title={text('Modal Title', 'Modal Title')}
        contentStyle={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
        maxWidth='80%'
      >
        <Text style={{margin: 4}}>Some text here</Text>
        <QRCode value="Hope you have a good day :)" />
        <Button mode="contained" style={{margin: 4}} onPress={() => setVisible(false)}>Close</Button>
      </Modal>
    </CenterView>
  )
}

storiesOf('Misc', module)
  .add('Tags', () => (
    <Tags
      tags={array('tags', ['foo', 'bar', 'baz'])}
      accented={boolean('accented', false)}
      onPress={action('onPress')}
    />
  ))
  .add('Socials', () => (
    <CenterView style={{padding: 10}}>
      <SocialLinks
        links={array('Links', ['twitter.com/SubsocialChain', 'twitter.com/Subsocial'])}
        onPress={action('onPress')}
        color={text('Color', '')}
        rtl={boolean('Right to Left', false)}
      />
    </CenterView>
  ))
  .add('Modal', () => <ModalStory />)
  .add('Balance', () => (
    <SubsocialProvider>
      <CenterView style={{padding: 10}}>
        <Balance
          address={text('Address', '3tZSKKfn9PSrLXTxExZtnhvV1oFyTjnF1P5pAnVyrdVs4h2v')}
          decimals={number('Decimals', 11)}
          truncate={number('Truncate', 11)}
          currency={text('Currency', 'SUB')}
        />
      </CenterView>
    </SubsocialProvider>
  ))
