//////////////////////////////////////////////////////////////////////
// Stories for testing Substrate/Subsocial API connection
// SPDX-License-Identifier: GPL-3.0
import React from 'react'
import { Text } from 'react-native'
import { storiesOf } from '@storybook/react-native'
import { SubstrateProvider, useSubstrate } from 'src/components/SubstrateContext'
import CenterView from '../CenterView'
import config from 'config.json'

storiesOf('API', module)
  .addDecorator(getStory => <CenterView>{getStory()}</CenterView>)
  .add('Substrate', () => {
    return (
      <SubstrateProvider endpoint={config.connections.ws.substrate}>
        <SubstrateConsumer />
      </SubstrateProvider>
    )
  })


function SubstrateConsumer() {
  const {apiState} = useSubstrate();
  
  console.log(apiState);
  switch (apiState) {
    case 'PENDING': return <Text>pending ...</Text>;
    case 'CONNECTING': return <Text>connecting ...</Text>;
    case 'READY': return <Text>✔️ ready</Text>;
    case 'ERROR': return <Text>❌ failed</Text>;
  }
}
