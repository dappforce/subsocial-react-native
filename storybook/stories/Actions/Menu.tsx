import React, { ReactElement, ReactNode } from 'react'
import { StyleProp, StyleSheet, View, ViewStyle } from 'react-native'
import { TouchableRipple } from 'react-native-paper'
import { createThemedStylesHook, useTheme } from '../../../src/components/Theming'
import { AnyIcon, IconRaw } from '~comps/Icon'
import { Text } from '~comps/Typography'
import { WithSize } from 'src/types'
import { BottomSheet } from '~stories/Modals/BottomSheet'
import strings from 'src/util/localization'

export type IconDescriptor = AnyIcon & {
  size?: number
  color?: string
}

export type ActionMenuProps = {
  title?: string
  primary?: ({ size }: WithSize) => ReactNode
  secondary?: ({ size }: WithSize) => ReactNode
  style?: StyleProp<ViewStyle>
  size?: number
}
export function ActionMenu({
  title = strings().general.actions,
  primary,
  secondary,
  size = 24,
  style
}: ActionMenuProps)
{
  const styles = useThemedStyles()
  
  return (
    <View style={[ styles.actionMenu, style ]}>
      {!!secondary && (
        <BottomSheet TriggerComponent={BottomSheet.trigger.MoreVertical}>
          <BottomSheet.ScrollView>
            <View style={styles.actionMenuTitleContainer}>
              <Text style={styles.actionMenuTitle}>{title}</Text>
            </View>
            {secondary?.({ size })}
          </BottomSheet.ScrollView>
        </BottomSheet>
      )}
      {primary?.({ size })}
    </View>
  )
}

export type PrimaryProps = {
  children?: ReactNode
  style?: StyleProp<ViewStyle>
};
ActionMenu.Primary = React.memo(function({ children, style }: PrimaryProps) {
  const styles = useThemedStyles()
  return (
    <View style={[ styles.actionPrimary, style ]}>
      {children}
    </View>
  )
})

export type ActionMenuItemProps = {
  label: string
  icon?: (({size}: WithSize) => ReactElement) | IconDescriptor
  containerStyle?: StyleProp<ViewStyle>
  iconContainerStyle?: StyleProp<ViewStyle>
  onPress: () => void
  disabled?: boolean
};
export const ActionMenuItem = React.memo(function({
  label,
  icon,
  containerStyle,
  iconContainerStyle,
  onPress,
  disabled
}: ActionMenuItemProps)
{
  const theme = useTheme()
  const styles = useThemedStyles()
  let iconRender = null
  
  if (icon) {
    if (typeof icon === 'function') {
      iconRender = icon({ size: 24 })
    }
    else {
      iconRender = (
        <IconRaw
          family={icon.family}
          name={icon.name}
          size={icon.size ?? 24}
          color={icon.color || (disabled ? theme.colors.textDisabled : theme.colors.divider)}
        />
      )
    }
  }
  
  return (
    <TouchableRipple style={[styles.actionSecondary, containerStyle]} {...{ onPress, disabled }}>
      <View style={styles.row}>
        <View style={[ styles.iconSecondary, iconContainerStyle ]}>
          {iconRender}
        </View>
        <Text style={[ styles.labelSecondary, disabled && { color: theme.colors.textDisabled } ]}>
          {label}
        </Text>
      </View>
    </TouchableRipple>
  )
})

const useThemedStyles = createThemedStylesHook(({ colors, consts }) => StyleSheet.create({
  actionMenu: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  actionMenuTitleContainer: {
    paddingHorizontal: 2 * consts.spacing,
    paddingBottom: consts.spacing,
    marginBottom: consts.spacing,
    color: colors.textSecondary,
    borderBottomWidth: 1,
    borderBottomColor: colors.line,
  },
  actionMenuTitle: {
    color: colors.textSecondary,
  },
  actionPrimary: {
    marginLeft: 6,
  },
  actionSecondary: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 0.5 * consts.spacing,
    minWidth: 200,
  },
  row: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconSecondary: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: 60,
  },
  labelSecondary: {
    flex: 1,
  },
}))
