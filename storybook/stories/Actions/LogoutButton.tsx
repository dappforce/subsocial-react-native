//////////////////////////////////////////////////////////////////////
// Counterpiece of LogalModal
// Deletes user's local account data
// User must reimport (hopefully) previously backed up wallet
import React, { useCallback } from 'react'
import { StyleSheet, View } from 'react-native'
import Snackbar from 'react-native-snackbar'
import { useSelectKeypair } from 'src/rtk/app/hooks'
import { useAppDispatch } from 'src/rtk/app/hooksCommon'
import { forgetKeypair } from 'src/rtk/features/accounts/localAccountSlice'
import { Modal } from '~stories/Modals/Modal'
import { Button, Text } from '~comps/Typography'

export type LogoutButtonProps = {
  
}
export function LogoutButton(props: LogoutButtonProps) {
  const [ showConfirm, setShowConfirm ] = React.useState(false)
  const dispatch = useAppDispatch()
  const keypair  = useSelectKeypair()
  
  const logout = useCallback(async () => {
    await dispatch(forgetKeypair())
    Snackbar.show({ text: 'Logged out' })
    setShowConfirm(false)
  }, [ dispatch, forgetKeypair ])
  
  return (
    <>
      <Button
        disabled={!keypair}
        onPress={() => setShowConfirm(true)}
      >
        Logout
      </Button>
      <Modal visible={showConfirm} onRequestClose={() => setShowConfirm(false)} title="Confirm Logout">
        <Text style={[styles.paragraph, { fontFamily: 'RobotoMedium', marginTop: 20, textAlign: 'center' }]}>
          Are you sure you wish to logout?
        </Text>
        <Text style={styles.paragraph}>
          This will delete your local account data. You will need to reimport your wallet if you wish to log back in.
        </Text>
        
        <View style={styles.buttonContainer}>
          <Button mode="contained" style={styles.button} onPress={logout}>Confirm</Button>
          <Button mode="outlined" style={[styles.button, {marginRight: 0}]} onPress={() => setShowConfirm(false)}>Cancel</Button>
        </View>
      </Modal>
    </>
  )
}

const styles = StyleSheet.create({
  paragraph: {
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
})
