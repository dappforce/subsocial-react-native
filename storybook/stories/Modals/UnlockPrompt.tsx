//////////////////////////////////////////////////////////////////////
// Prompt the user to unlock their keypair by entering their passphrase
import React, { useCallback, useState } from 'react'
import { StyleProp, StyleSheet, View, ViewStyle } from 'react-native'
import { TextInput } from 'react-native-paper'
import { useKeypair } from 'src/rtk/app/hooks'
import { delaySnack } from 'src/util/snack'
import { useMountState } from '~comps/hooks'
import { createThemedStylesHook, useTheme } from '~comps/Theming'
import { Button, Text } from '~comps/Typography'
import { Modal } from './Modal'

export type UnlockPromptProps = {
  visible: boolean
  onClose: () => void
  modalStyle?: StyleProp<ViewStyle>
}

export function UnlockPrompt({ visible, onClose, modalStyle }: UnlockPromptProps) {
  const isMounted = useMountState()
  const theme = useTheme()
  const styles = useThemedStyles()
  const keypair = useKeypair()
  const [ loading, setLoading ] = useState(false)
  const [ passphrase, setPassphrase ] = useState('')
  
  const unlock = useCallback(async () => {
    if (keypair) {
      setLoading(true)
      try {
        await keypair.unlock(passphrase).then(isMounted.gate)
        
        if (keypair.isLocked()) {
          delaySnack({ text: 'Failed to unlock wallet', textColor: theme.colors.rejection })
        }
        else {
          delaySnack({ text: 'Successfully unlocked wallet', textColor: theme.colors.confirmation })
        }
        onClose()
      }
      catch (ex) {
        delaySnack({ text: `Unlock wallet failed: ${(ex as Error).message}`, textColor: theme.colors.rejection })
      }
      finally {
        if (isMounted()) {
          setLoading(false)
        }
      }
    }
  }, [ passphrase ])
  
  return (
    <Modal
      visible={visible}
      title="Unlock your Wallet"
      onRequestClose={onClose}
      containerStyle={[styles.container, modalStyle]}
    >
      <Text style={styles.paragraph}>
        For your safety, your wallet is locked periodically. Please
        enter your passphrase below to unlock.
      </Text>
      
      <TextInput
        mode="outlined"
        autoFocus
        secureTextEntry
        onSubmitEditing={unlock}
        onChangeText={setPassphrase}
        style={styles.input}
      />
      
      <Button
        mode="contained"
        onPress={unlock}
        loading={loading}
      >
        Unlock
      </Button>
    </Modal>
  )
}

const useThemedStyles = createThemedStylesHook(({ consts }) => StyleSheet.create({
  container: {
    display: 'flex',
    flexDirection: 'column',
  },
  paragraph: {
    marginVertical: consts.spacing,
  },
  input: {
    width: '100%',
    height: 3 * consts.spacing,
    marginBottom: consts.spacing,
  },
}))
