import React, { ReactElement, ReactNode, useState } from 'react'
import { StyleProp, StyleSheet, View, ViewStyle } from 'react-native'
import { Icon } from 'react-native-elements'
import { Menu, TouchableRipple } from 'react-native-paper'
import { useTheme } from '../../../src/components/Theming'
import { Text } from '~comps/Typography'
import { IconFamily } from 'src/util'

export type WithSize = {size: number}
export type IconDescriptor = {
  name: string
  family: IconFamily
  size?: number
}

export type ActionMenuProps = {
  primary?: ({size}: WithSize) => ReactNode
  secondary?: ({size}: WithSize) => ReactNode
  style?: StyleProp<ViewStyle>
  size?: number
}
export function ActionMenu({primary, secondary, size = 24, style}: ActionMenuProps) {
  const theme = useTheme();
  const [showSecondary, setShowSecondary] = useState(false);
  
  return (
    <View style={[styles.actionMenu, style]}>
      {!!secondary &&
        <Menu
          visible={showSecondary}
          onDismiss={() => setShowSecondary(false)}
          anchor={<Icon name="more-horizontal" type="feather" size={size} style={{color: theme.colors.textSecondary}} onPress={() => setShowSecondary(true)} />}
        >
          {secondary?.({size})}
        </Menu>
      }
      {primary?.({size})}
    </View>
  )
}

export type PrimaryProps = React.PropsWithChildren<{
  style?: StyleProp<ViewStyle>
}>;
ActionMenu.Primary = function({children, style}: PrimaryProps) {
  return (
    <View style={[styles.actionPrimary, style]}>
      {children}
    </View>
  )
}

export type SecondaryProps = {
  label: string
  icon?: (() => ReactElement) | IconDescriptor
  iconContainerStyle?: StyleProp<ViewStyle>
  onPress: () => void
  disabled?: boolean
};
ActionMenu.Secondary = function({label, icon, iconContainerStyle, onPress, disabled}: SecondaryProps) {
  const theme = useTheme();
  
  let iconRender = null;
  if (icon) {
    if (typeof icon === 'function') {
      iconRender = icon();
    }
    else {
      iconRender = (
        <Icon
          name={icon.name}
          type={icon.family}
          size={icon.size ?? 24}
          color={disabled ? theme.colors.textDisabled : theme.colors.textPrimary}
        />
      )
    }
  }
  
  return (
    <TouchableRipple style={styles.actionSecondary} {...{onPress, disabled}}>
      <>
        <View style={[styles.iconSecondary, iconContainerStyle]}>
          {iconRender}
        </View>
        <Text style={[disabled && {color: theme.colors.textDisabled}]}>
          {label}
        </Text>
      </>
    </TouchableRipple>
  )
}

const styles = StyleSheet.create({
  actionMenu: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  actionPrimary: {
    marginLeft: 6,
  },
  actionSecondary: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    minWidth: 200,
  },
  iconSecondary: {
    width: 36,
  },
});
