//////////////////////////////////////////////////////////////////////
// Stories for testing Substrate/Subsocial API connection
// SPDX-License-Identifier: GPL-3.0
import React from 'react'
import { Text } from 'react-native-paper'
import { storiesOf } from '@storybook/react-native'
import { SubsocialProvider, useSubsocial, useSubstrate } from '~comps/SubsocialContext'
import CenterView from '../CenterView'

storiesOf('API', module)
  .addDecorator(getStory => <CenterView>{getStory()}</CenterView>)
  .add('Substrate', () => <SubstrateConsumer />)
  .add('Subsocial', () => (
    <SubsocialProvider>
      <SubsocialConsumer />
    </SubsocialProvider>
  ))


function SubstrateConsumer() {
  const {connectionState} = useSubstrate();
  
  switch (connectionState) {
    case 'PENDING': return <Text>pending ...</Text>;
    case 'CONNECTING': return <Text>connecting ...</Text>;
    case 'READY': return <Text>✔️ ready</Text>;
    case 'ERROR': return <Text>❌ failed</Text>;
  }
}

function SubsocialConsumer() {
  const {connectionState} = useSubsocial();
  
  switch (connectionState) {
    case 'PENDING': return <Text>pending ...</Text>;
    case 'CONNECTED': return <Text>✔️ ready</Text>;
    case 'ERROR': return <Text>❌ failed</Text>;
  }
}
