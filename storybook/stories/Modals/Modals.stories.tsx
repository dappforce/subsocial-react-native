import React from 'react'
import { StyleSheet } from 'react-native'
import { storiesOf } from '@storybook/react-native'
import { text } from '@storybook/addon-knobs'
import { useAppDispatch } from 'src/rtk/app/hooksCommon'
import { setPrompt } from 'src/rtk/features/ui/uiSlice'
import { Button, Text } from '~comps/Typography'
import { Modal } from './Modal'
import { ModalPortal } from './ModalPortal'
import QRCode from 'react-native-qrcode-svg'
import CenterView from '../CenterView'

storiesOf('Modals', module)
  .addDecorator(getStory => <CenterView style={styles.padded}>{getStory()}</CenterView>)
  .add('Modal', () => <ModalStory />)
  .add('Login Prompt', () => <LoginPromptStory />)
  .add('Unlock Prompt', () => <UnlockPromptStory />)

function ModalStory() {
  const [ visible, setVisible ] = React.useState(false)
  const onRequestClose = () => setVisible(false)
  
  return (
    <CenterView style={styles.padded}>
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
        <Text style={styles.margined}>Some text here</Text>
        <QRCode value="Hope you have a good day :)" />
        <Button mode="contained" style={styles.margined} onPress={() => setVisible(false)}>Close</Button>
      </Modal>
    </CenterView>
  )
}

function LoginPromptStory() {
  const dispatch = useAppDispatch()
  
  return (
    <>
      <ModalPortal />
      <Button
        mode="text"
        onPress={() => dispatch(setPrompt('login'))}
      >
        Open Login Prompt
      </Button>
    </>
  )
}

function UnlockPromptStory() {
  const dispatch = useAppDispatch()
  
  return (
    <>
      <ModalPortal />
      <Button
        mode="text"
        onPress={() => dispatch(setPrompt('unlock'))}
      >
        Open Unlock Prompt
      </Button>
    </>
  )
}

const styles = StyleSheet.create({
  padded: {
    padding: 20,
  },
  margined: {
    margin: 20,
  },
})
