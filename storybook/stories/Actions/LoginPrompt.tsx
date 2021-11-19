//////////////////////////////////////////////////////////////////////
// LoginPrompt context
// -----
// Preliminary solution until we have proper onboarding
import React, { useCallback, useState } from 'react'
import { StyleSheet, View } from 'react-native'
import { TextInput } from 'react-native-paper'
import { useAppDispatch } from 'src/rtk/app/hooksCommon'
import { createThemedStylesHook, useTheme } from '~comps/Theming'
import { Button, Text } from '~comps/Typography'
import { Modal } from '~stories/Misc/Modal'
import { storeKeypair, loadOrUnlockKeypair } from 'src/rtk/features/accounts/localAccountSlice'
import { generateRandomKeypair, NoKeypairError } from 'src/crypto/keypair'
import { delaySnack } from 'src/util'
import { logger as createLogger } from '@polkadot/util'

const log = createLogger('LoginPrompt')

export type LoginPromptProps = {
  visible: boolean
  onClose: () => void
}
export function LoginPrompt({ visible, onClose }: LoginPromptProps) {
  const dispatch = useAppDispatch()
  const styles = useThemedStyles()
  const theme = useTheme()
  const [ passphrase, setPassphrase ] = useState('')
  
  const generate = useCallback(async () => {
    await dispatch(storeKeypair({ keypair: generateRandomKeypair(), passphrase })).unwrap()
    delaySnack({ text: 'Keypair generated', textColor: theme.colors.confirmation })
    onClose()
  }, [ passphrase, onClose ])
  
  const restore = useCallback(async () => {
    try {
      await dispatch(loadOrUnlockKeypair(passphrase)).unwrap()
      delaySnack({ text: 'Successfully restored keypair', textColor: theme.colors.confirmation })
      onClose()
    }
    catch (err) {
      if (err instanceof NoKeypairError) {
        delaySnack({ text: 'No keypair stored', textColor: theme.colors.rejection })
      }
      else {
        delaySnack({ text: 'Failed to recover keypair', textColor: theme.colors.rejection })
        log.error(err)
      }
    }
  }, [ passphrase, onClose ])
  
  return (
    <Modal visible={visible} title="Login required" onRequestClose={onClose} containerStyle={styles.container}>
      <Text style={styles.paragraph}>
        You need to login to use this feature.
      </Text>
      <Text style={styles.paragraph}>
        For development & testing purposes, you can currently only generate a random keypair or restore from secure storage.
      </Text>
      
      <TextInput
        label="Passphrase (optional)"
        mode="outlined"
        value={passphrase}
        onChangeText={setPassphrase}
        secureTextEntry
        style={styles.passphrase}
      />
      
      <View style={styles.buttonContainer}>
        <Button mode="contained" onPress={generate} style={styles.button}>
          Generate
        </Button>
        <Button mode="contained" onPress={restore} style={styles.button}>
          Restore
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
  passphrase: {
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
