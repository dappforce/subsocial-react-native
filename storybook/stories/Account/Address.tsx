import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { StyleSheet, View } from 'react-native'
import Clipboard from '@react-native-community/clipboard'
import QRCode from 'react-native-qrcode-svg'
import Snackbar from 'react-native-snackbar'
import * as Linking from 'expo-linking'
import { Icon, IconProps } from '~comps/Icon'
import { AccountId } from 'src/types/subsocial'
import { Theme, useTheme } from '~comps/Theming'
import { TouchableRipple } from '~comps/TouchableRipple'
import { Button, ButtonProps, Text } from '~comps/Typography'
import { Modal } from '~stories/Misc'
import SubIdSvg from 'assets/subid-logo.svg'

export type AddressProps = {
  id: AccountId
}
export const Address = React.memo(({ id }: AddressProps) => {
  const theme = useTheme()
  const styles = useMemo(() => createStyles(theme), [ theme ])
  const [ showQR, setShowQR ] = useState(false)
  
  const iconSize = 20
  const rippleSize = 16
  
  const MyIcon = useCallback(({ ...props }: IconProps) => {
    return (
      <Icon
        size={iconSize}
        color={theme.colors.textPrimary}
        containerStyle={styles.actionIconContainer} {...props}
        rippleSize={rippleSize}
        rippleBorderless={true}
      />
    )
  }, [])
  
  const onCopy = useCallback(() => {
    Clipboard.setString(id)
    Snackbar.show({text: 'Copied address to clipboard ✓'})
  }, [ id ])
  
  const onShowQR = useCallback(() => {
    setShowQR(true)
  }, [ setShowQR ])
  
  const onPressSubID = useCallback(() => {
    Linking.openURL(`https://sub.id/#/${id}`)
  }, [ id ])
  
  return (
    <View style={styles.container}>
      <View style={styles.address}>
        <MyIcon family="ionicon" name="wallet-outline" color={theme.colors.divider} containerStyle={styles.walletIcon} />
        <Text>{truncateAddress(id)}</Text>
      </View>
      
      <MyIcon family="ionicon" name="copy-outline" onPress={onCopy} />
      <MyIcon family="ionicon" name="qr-code-outline" onPress={onShowQR} />
      <TouchableRipple
        style={styles.actionIconContainer}
        rippleSize={rippleSize}
        rippleBorderless
        onPress={onPressSubID}
      >
        <SubIdSvg width={iconSize} height={iconSize} />
      </TouchableRipple>
      
      <AddressQRModal
        {...{ id, styles, theme }}
        visible={showQR}
        onClose={() => setShowQR(false)}
      />
    </View>
  )
})

type AddressQRModalProps = {
  id: AccountId
  visible: boolean
  onClose: () => void
  styles: ReturnType<typeof createStyles>
  theme: Theme
}
function AddressQRModal({ id, visible, onClose, styles, theme }: AddressQRModalProps) {
  const [ copyClicked, setCopyClicked ] = useState(false)
  
  const onModalCopy = useCallback(() => {
    Clipboard.setString(id)
    setCopyClicked(true)
  }, [ id ])
  
  const modalCopyIcon = useMemo<ButtonProps['icon']>(() => {
    if (copyClicked) {
      return ({ size }) => (
        <Icon
          family="ionicon"
          name="checkmark-circle-outline"
          size={size}
          color={theme.colors.background}
        />
      )
    }
    
    else {
      return ({ size }) => (
        <Icon
          family="ionicon"
          name="copy-outline"
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
          value={id}
          size={180}
          logo={require('assets/subsocial-logo.png')}
          logoSize={50}
          logoBackgroundColor="transparent"
        />
      </View>
      <Text style={styles.modalAddress}>{id}</Text>
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

const truncateAddress = (id: AccountId) => id.substr(0, 6) + '...' + id.substr(-6)

const createStyles = ({ colors }: Theme) => StyleSheet.create({
  container: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
  },
  address: {
    flex: 1,
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 40,
    padding: 4,
    marginRight: 10,
    borderColor: colors.line,
  },
  walletIcon: {
    margin: 4,
    marginRight: 8,
  },
  actionIconContainer: {
    marginLeft: 10,
  },
  modalContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },
  modalQR: {
    alignSelf: 'center',
  },
  modalAddress: {
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
})
