import React, { useCallback } from 'react'
import { View, StyleSheet } from 'react-native'
import Clipboard from '@react-native-community/clipboard'
import Snackbar from 'react-native-snackbar'
import * as Linking from 'expo-linking'
import { Icon, IconProps } from '~comps/Icon'
import { AccountId } from 'src/types/subsocial'
import { Theme, useTheme } from '~comps/Theming'
import { TouchableRipple } from '~comps/TouchableRipple'
import { Text } from '~comps/Typography'
import SubIdSvg from 'assets/subid-logo.svg'

export type AddressProps = {
  id: AccountId
}
export const Address = React.memo(({id}: AddressProps) => {
  const theme = useTheme()
  const themedStyles = createThemedStyles(theme)
  const iconSize = 20
  const rippleSize = 16
  
  const MyIcon = useCallback(({...props}: IconProps) => {
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
  
  const onPressSubID = useCallback(() => {
    Linking.openURL(`https://sub.id/#/${id}`)
  }, [ id ])
  
  return (
    <View style={styles.container}>
      <View style={[styles.address, themedStyles.address]}>
        <MyIcon family="ionicon" name="wallet-outline" color={theme.colors.divider} containerStyle={styles.walletIcon} />
        <Text>{truncateAddress(id)}</Text>
      </View>
      <MyIcon
        family="ionicon"
        name="copy-outline"
        onPress={onCopy}
      />
      <MyIcon
        family="ionicon"
        name="qr-code-outline"
        onPress={() => console.log("TODO: show QR")}
      />
      <TouchableRipple
        style={styles.actionIconContainer}
        rippleSize={rippleSize}
        rippleBorderless={true}
        onPress={onPressSubID}
      >
        <SubIdSvg width={iconSize} height={iconSize} />
      </TouchableRipple>
    </View>
  )
})

const truncateAddress = (id: AccountId) => id.substr(0, 6) + '...' + id.substr(-6)

const styles = StyleSheet.create({
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
  },
  walletIcon: {
    marginRight: 2,
  },
  actionIconContainer: {
    marginLeft: 10,
  },
})

const createThemedStyles = ({colors}: Theme) => StyleSheet.create({
  address: {
    borderColor: colors.line,
  },
})
