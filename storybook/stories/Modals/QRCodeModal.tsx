import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { StyleSheet, View } from 'react-native'
import Clipboard from '@react-native-community/clipboard'
import QRCode from 'react-native-qrcode-svg'
import { createThemedStylesHook, useTheme } from '~comps/Theming'
import { Button, ButtonProps, Text } from '~comps/Typography'
import { Icon } from '~comps/Icon'
import { Modal } from './Modal'

export type QRCodeModalProps = {
  data: string
  visible: boolean
  onClose: () => void
}
export function QRCodeModal({ data, visible, onClose }: QRCodeModalProps) {
  const theme = useTheme()
  const styles = useThemedStyles()
  const [ copyClicked, setCopyClicked ] = useState(false)
  
  const onModalCopy = useCallback(() => {
    Clipboard.setString(data)
    setCopyClicked(true)
  }, [ data ])
  
  const modalCopyIcon = useMemo<ButtonProps['icon']>(() => {
    if (copyClicked) {
      return ({ size }) => (
        <Icon
          icon={{
            family: 'ionicon',
            name: 'checkmark-circle-outline',
          }}
          size={size}
          color={theme.colors.background}
        />
      )
    }
    
    else {
      return ({ size }) => (
        <Icon
          icon={{
            family: 'subicon',
            name: 'copy',
          }}
          size={size}
          color={theme.colors.background}
        />
      )
    }
  }, [ copyClicked ])
  
  useEffect(() => {
    if (copyClicked) {
      const timeout = setTimeout(() => {
        setCopyClicked(false)
      }, 1000)
      
      return () => clearTimeout(timeout)
    }
  }, [ copyClicked ])
  
  return (
    <Modal
      title="Account address"
      titleContainerStyle={{ marginBottom: Modal.PADDING }}
      visible={visible}
      onRequestClose={onClose}
      onDismiss={onClose}
      contentContainerStyle={styles.modalContainer}
    >
      <View style={styles.modalQR}>
        <QRCode
          value={data}
          size={180}
          logo={require('assets/subsocial-logo.png')}
          logoSize={50}
          logoBackgroundColor="transparent"
        />
      </View>
      <Text style={styles.modalData}>{data}</Text>
      <View style={styles.modalButtons}>
        <Button
          mode="outlined"
          onPress={onClose}
          style={[ styles.modalButton, {marginRight: Modal.PADDING} ]}
        >
          Close
        </Button>
        <Button
          mode="contained"
          onPress={onModalCopy}
          style={styles.modalButton}
          icon={modalCopyIcon}
          color={copyClicked ? theme.colors.confirmation : theme.colors.primary}
        >
          Copy
        </Button>
      </View>
    </Modal>
  )
}

const useThemedStyles = createThemedStylesHook(() => StyleSheet.create({
  modalContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },
  modalQR: {
    alignSelf: 'center',
  },
  modalData: {
    fontFamily: 'RobotoMedium',
    textAlign: 'center',
    marginVertical: Modal.PADDING,
  },
  modalButtons: {
    display: 'flex',
    flexDirection: 'row',
  },
  modalButton: {
    flex: 1,
  },
}))
