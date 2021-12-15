//////////////////////////////////////////////////////////////////////
// Specialized Modal "Portal" supporting various standard modals
// used throughout the app.
import React, { useCallback } from 'react'
import { StyleSheet } from 'react-native'
import { useAppDispatch, useAppSelector } from 'src/rtk/app/hooksCommon'
import { clearPrompt } from 'src/rtk/features/ui/uiSlice'
import { LoginPrompt } from './LoginPrompt'
import { UnlockPrompt } from './UnlockPrompt'

export type ModalPortalProps = {
  
}

export function ModalPortal({}: ModalPortalProps) {
  const prompt = useAppSelector(state => state.ui.prompt)
  const dispatch = useAppDispatch()
  
  const onClosePrompt = useCallback(() => {
    dispatch(clearPrompt())
  }, [ dispatch ])
  
  return (
    <>
      <LoginPrompt visible={prompt === 'login'} onClose={onClosePrompt} />
      <UnlockPrompt visible={prompt === 'unlock'} onClose={onClosePrompt} />
    </>
  )
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 999,
  },
})
