//////////////////////////////////////////////////////////////////////
// LoginPrompt context
// -----
// Preliminary solution until we have proper onboarding
import React, { useCallback, useState } from 'react'
import { StyleSheet, TextInput as RNTextInput, View } from 'react-native'
import { TextInput } from 'react-native-paper'
import { useAppDispatch } from 'src/rtk/app/hooksCommon'
import { useCheckForStoredKeypair } from 'src/rtk/app/hooks'
import { createThemedStylesHook, useTheme } from '~comps/Theming'
import { Button, Text } from '~comps/Typography'
import { Modal } from './Modal'
import { storeKeypair, loadKeypair, unlockKeypair } from 'src/rtk/features/accounts/localAccountSlice'
import { fromSuri as generateKeypairFromSuri, generateRandomKeypair, NoKeypairError } from 'src/crypto/keypair'
import { delaySnack, snack } from 'src/util/snack'
import { trial } from 'src/util/control'
import { logger as createLogger } from '@polkadot/util'
import { keyExtractSuri } from '@polkadot/util-crypto'

const log = createLogger('LoginPrompt')

export type LoginPromptProps = {
  visible: boolean
  onClose: () => void
}
export function LoginPrompt({ visible, onClose }: LoginPromptProps) {
  const styles = useThemedStyles()
  const [ showImport, setShowImport ] = useState(false)
  
  const toggleView = useCallback(() => {
    setShowImport(!showImport)
  }, [ showImport, setShowImport ])
  
  return (
    <Modal visible={visible} title="Login required" onRequestClose={onClose} containerStyle={styles.container}>
      <Text style={styles.paragraph}>
        You need to login to use this feature.
      </Text>
      
      {!showImport
      ? <RestoreView {...{ onClose, toggleView }} />
      : <ImportView {...{ onClose, toggleView }} />
      }
    </Modal>
  )
}

type SubviewProps = {
  onClose: LoginPromptProps['onClose']
  toggleView: () => void
}

const RestoreView = React.memo(({ onClose, toggleView }: SubviewProps) => {
  const dispatch = useAppDispatch()
  const stored   = useCheckForStoredKeypair()
  const styles   = useThemedStyles()
  const theme    = useTheme()
  const [ passphrase, setPassphrase ] = useState('')
  
  const generate = useCallback(async () => {
    await dispatch(storeKeypair({ keypair: generateRandomKeypair(), passphrase })).unwrap()
    delaySnack({ text: 'Keypair generated', textColor: theme.colors.confirmation })
    onClose()
  }, [ passphrase, onClose ])
  
  const restore = useCallback(async () => {
    try {
      await dispatch(loadKeypair()).unwrap()
      await dispatch(unlockKeypair(passphrase)).unwrap()
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
    <>
      <TextInput
        label="Passphrase (optional)"
        mode="outlined"
        value={passphrase}
        secureTextEntry
        autoFocus
        onChangeText={setPassphrase}
        onSubmitEditing={restore}
        style={styles.lastInput}
      />
      
      <View style={styles.firstButtonContainer}>
        <Button mode="contained" disabled={!stored} onPress={restore} style={styles.button}>
          Restore
        </Button>
        <Button mode="outlined" onPress={onClose} style={styles.lastButton}>
          Cancel
        </Button>
      </View>
      <View style={styles.buttonContainer}>
        <Button mode="text" onPress={toggleView} style={styles.button}>
          Import
        </Button>
        <Button mode="text" onPress={generate} style={styles.lastButton}>
          Generate
        </Button>
      </View>
    </>
  )
})

const ImportView = React.memo(({ onClose, toggleView }: SubviewProps) => {
  const dispatch = useAppDispatch()
  const styles = useThemedStyles()
  const theme = useTheme()
  
  const [ importing, setImporting ] = useState(false)
  const [ mnemonic, setMnemonic ] = useState('')
  const [ derivePath, setDerivePath ] = useState('')
  const [ passphrase, setPassphrase ] = useState('')
  const [ input2, setInput2 ] = useState<RNTextInput | null>(null)
  const [ input3, setInput3 ] = useState<RNTextInput | null>(null)
  
  const importMnemonic = useCallback(() => {
    setImporting(true)
    
    // Subtle delay so `importing` can affect the button
    setTimeout(() => {
      trial(() => {
        const { path } = derivePath ? keyExtractSuri(derivePath) : { path: '' }
        return generateKeypairFromSuri(mnemonic + path)
      })
      
      .then(({ keypair }) => {
        dispatch(storeKeypair({ keypair, passphrase }))
        
        delaySnack({ text: 'Successfully imported', textColor: theme.colors.confirmation }, 500)
        setImporting(false)
        onClose()
      })
      
      .catch(err => {
        snack({ text: 'Failed to import wallet', textColor: theme.colors.rejection })
        log.error(err)
      })
    }, 1)
  }, [ mnemonic, derivePath, passphrase ])
  
  return (
    <>
      <TextInput
        label="Mnemonic"
        mode="outlined"
        onChangeText={setMnemonic}
        onSubmitEditing={() => setTimeout(() => input2?.focus(), 100)}
        returnKeyType="next"
        blurOnSubmit={false}
        autoFocus
        style={styles.input}
      />
      <TextInput
        label="Derive Path (optional, advanced)"
        mode="outlined"
        onChangeText={setDerivePath}
        onSubmitEditing={() => setTimeout(() => input3?.focus(), 100)}
        ref={(ref) => setInput2(ref)}
        returnKeyType="next"
        blurOnSubmit={false}
        style={styles.input}
      />
      <TextInput
        label="Passphrase (optional)"
        mode="outlined"
        secureTextEntry
        onChangeText={setPassphrase}
        onSubmitEditing={importMnemonic}
        ref={(ref) => setInput3(ref)}
        returnKeyType="done"
        style={styles.lastInput}
      />
      
      <View style={styles.firstButtonContainer}>
        <Button
          mode="contained"
          onPress={importMnemonic}
          loading={importing}
          style={styles.button}
        >
          Import
        </Button>
        <Button mode="outlined" onPress={onClose} style={styles.lastButton}>Cancel</Button>
      </View>
      <View style={styles.buttonContainer}>
        <Button mode="text" onPress={toggleView} style={styles.lastButton}>Restore</Button>
      </View>
    </>
  )
})

const useThemedStyles = createThemedStylesHook(({ fonts, consts }) => StyleSheet.create({
  container: {
    flexDirection: 'column',
    alignItems: 'center',
  },
  paragraph: {
    marginBottom: 2 * consts.spacing,
    lineHeight: 20,
  },
  input: {
    fontSize: fonts.secondary.fontSize,
    width: '100%',
    height: 4 * consts.spacing,
    marginBottom: consts.spacing,
  },
  lastInput: {
    fontSize: fonts.secondary.fontSize,
    width: '100%',
    height: 4 * consts.spacing,
    marginBottom: 2 * consts.spacing,
  },
  firstButtonContainer: {
    display: 'flex',
    flexDirection: 'row',
  },
  buttonContainer: {
    display: 'flex',
    flexDirection: 'row',
    marginTop: consts.spacing,
  },
  button: {
    flex: 1,
    marginRight: 2 * consts.spacing,
  },
  lastButton: {
    flex: 1,
  },
}))
