//////////////////////////////////////////////////////////////////////
// LoginPrompt context
// -----
// Preliminary solution until we have proper onboarding
import React, { useCallback, useState } from 'react'
import { StyleSheet, View } from 'react-native'
import { TextInput } from 'react-native-paper'
import Clipboard from '@react-native-community/clipboard'
import Snackbar from 'react-native-snackbar'
import { useAppDispatch } from 'src/rtk/app/hooksCommon'
import { Icon } from '~comps/Icon'
import { createThemedStylesHook } from '~comps/Theming'
import { Button, Text } from '~comps/Typography'
import { Modal } from '~stories/Misc/Modal'
import { importKeypair, Keypair } from 'src/rtk/features/accounts/localAccountSlice'

export type LoginPromptProps = {
  visible: boolean
  onClose: () => void
}
export function LoginPrompt({ visible, onClose }: LoginPromptProps) {
  const styles = useThemedStyles()
  const dispatch = useAppDispatch()
  const [ json, setJson ] = useState('{}')
  
  const paste = useCallback(async () => {
    setJson(await Clipboard.getString())
  }, [ setJson ])
  
  const importJson = useCallback(async () => {
    let keypair: Keypair | undefined
    try {
      keypair = await dispatch(importKeypair({ json })).unwrap()
    }
    catch {}
    
    // show snackbar after modal vanishes
    // otherwise snackbar vanishes together with modal
    setTimeout(() => {
      if (keypair) {
        Snackbar.show({
          text: 'Successfully imported wallet',
          textColor: '#10c928',
        })
      }
      else {
        Snackbar.show({
          text: 'Failed to import wallet',
          textColor: 'red',
        })
      }
    }, 100)
    
    onClose()
  }, [ dispatch, json ])
  
  return (
    <Modal visible={visible} title="Login required" onRequestClose={onClose} containerStyle={styles.container}>
      <Text style={styles.paragraph}>
        You need to login to use this feature.
      </Text>
      <Text style={styles.paragraph}>
        Currently, you must import your Polkadot wallet keypair JSON{'\n'}
        while we are working on a proper on-boarding process.
      </Text>
      <TextInput
        label="Import Wallet"
        mode="outlined"
        value={json}
        right={<Icon family="ionicon" name="clipboard-outline" onPress={paste} />} // TODO: it doesn't work...
        onChangeText={setJson}
        style={styles.importInput}
      />
      <View style={styles.buttonContainer}>
        <Button mode="contained" onPress={importJson} style={styles.button}>
          Import
        </Button>
        <Button mode="outlined" onPress={onClose} style={[styles.button, { marginRight: 0 }]}>
          Cancel
        </Button>
      </View>
    </Modal>
  )
}

const useThemedStyles = createThemedStylesHook(({ colors }) => StyleSheet.create({
  container: {
    flexDirection: 'column',
    alignItems: 'center',
  },
  paragraph: {
    marginBottom: 20,
    lineHeight: 20,
  },
  importInput: {
    width: '100%',
    marginBottom: 20,
  },
  buttonContainer: {
    display: 'flex',
    flexDirection: 'row',
  },
  button: {
    flex: 1,
    marginRight: 20,
  },
}))
