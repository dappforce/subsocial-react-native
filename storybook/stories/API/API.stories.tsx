//////////////////////////////////////////////////////////////////////
// Stories for testing Substrate/Subsocial API connection
// SPDX-License-Identifier: GPL-3.0
import React from 'react'
import { storiesOf } from '@storybook/react-native'
import { SubstrateProvider, useSubstrate } from '../../../src/components/SubstrateContext'
import { SubsocialProvider, useSubsocial } from '../../../src/components/SubsocialContext'
import SubsocialText from '../SubsocialText'
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
    case 'PENDING': return <SubsocialText>pending ...</SubsocialText>;
    case 'CONNECTING': return <SubsocialText>connecting ...</SubsocialText>;
    case 'READY': return <SubsocialText>✔️ ready</SubsocialText>;
    case 'ERROR': return <SubsocialText>❌ failed</SubsocialText>;
  }
}

function SubsocialConsumer() {
  const {connectionState} = useSubsocial();
  
  switch (connectionState) {
    case 'PENDING': return <SubsocialText>pending ...</SubsocialText>;
    case 'CONNECTED': return <SubsocialText>✔️ ready</SubsocialText>;
    case 'ERROR': return <SubsocialText>❌ failed</SubsocialText>;
  }
}
