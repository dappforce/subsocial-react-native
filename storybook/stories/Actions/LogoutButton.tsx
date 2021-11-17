//////////////////////////////////////////////////////////////////////
// Counterpiece of LogalModal
// Deletes user's local account data
// User must reimport (hopefully) previously backed up wallet
import React, { useCallback } from 'react'
import Snackbar from 'react-native-snackbar'
import { useSelectKeypair } from 'src/rtk/app/hooks'
import { useAppDispatch } from 'src/rtk/app/hooksCommon'
import { forgetKeypair } from 'src/rtk/features/accounts/localAccountSlice'
import { Button } from '~comps/Typography'

export type LogoutButtonProps = {
  
}
export function LogoutButton(props: LogoutButtonProps) {
  const dispatch = useAppDispatch()
  const keypair  = useSelectKeypair()
  
  const onPress = useCallback(async () => {
    await dispatch(forgetKeypair())
    Snackbar.show({ text: 'Logged out' })
  }, [ dispatch, forgetKeypair ])
  
  return (
    <Button
      disabled={!keypair}
      onPress={onPress}
    >
      Logout
    </Button>
  )
}
