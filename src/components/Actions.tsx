import React, { ReactNode, useState } from 'react'
import { Pressable, StyleProp, StyleSheet, View, ViewStyle } from 'react-native'
import { Icon } from 'react-native-elements'
import { Menu } from 'react-native-paper'
import { Text } from '~comps/Typography'
import { useTheme } from './Theming'

export type ActionsProps = {
  primary?: () => ReactNode
  secondary?: () => ReactNode
  style?: StyleProp<ViewStyle>
  size?: number
}
export function Actions({primary, secondary, size = 24, style}: ActionsProps) {
  const theme = useTheme();
  const [showSecondary, setShowSecondary] = useState(false);
  
  return (
    <View style={[styles.actions, style]}>
      {!!secondary &&
        <Menu
          visible={showSecondary}
          onDismiss={() => setShowSecondary(false)}
          anchor={<Icon name="more-horizontal" type="feather" size={size} style={{color: theme.colors.textSecondary}} onPress={() => setShowSecondary(true)} />}
        >
          {secondary?.()}
        </Menu>
      }
      {primary?.()}
    </View>
  )
}

export type PrimaryActionProps = React.PropsWithChildren<{
  style?: StyleProp<ViewStyle>
}>
export function PrimaryAction({children, style}: PrimaryActionProps) {
  return (
    <View style={[styles.action, style]}>
      {children}
    </View>
  )
}

export type SecondaryActionProps = {
  children: string | ReactNode[]
}
export function SecondaryAction({children}: SecondaryActionProps) {
  return (
    <Pressable>
      {typeof children === 'string' ? <Text>{children}</Text> : children}
    </Pressable>
  )
}

const styles = StyleSheet.create({
  actions: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  action: {
    marginHorizontal: 6,
  },
});
