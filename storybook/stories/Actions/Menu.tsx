import React, { ReactElement, ReactNode, useRef } from 'react'
import { StyleProp, StyleSheet, View, ViewStyle } from 'react-native'
import { TouchableRipple } from 'react-native-paper'
import { BottomSheetBackdrop, BottomSheetModal, BottomSheetScrollView } from '@gorhom/bottom-sheet'
import { createThemedStylesHook, useTheme } from '../../../src/components/Theming'
import { AnyIcon, Icon, IconRaw } from '~comps/Icon'
import { Text } from '~comps/Typography'
import { WithSize } from 'src/types'

export type IconDescriptor = AnyIcon & {
  size?: number
  color?: string
}

export type ActionMenuProps = {
  primary?: ({ size }: WithSize) => ReactNode
  secondary?: ({ size }: WithSize) => ReactNode
  style?: StyleProp<ViewStyle>
  size?: number
}
export function ActionMenu({ primary, secondary, size = 24, style }: ActionMenuProps) {
  const bottomSheet = useRef<BottomSheetModal>(null)
  const theme = useTheme();
  const styles = useThemedStyles()
  
  return (
    <View style={[ styles.actionMenu, style ]}>
      {!!secondary && (
        <>
          <Icon
            icon={{
              family: 'ionicon',
              name: 'ellipsis-vertical',
            }}
            size={size}
            color={theme.colors.textSecondary}
            onPress={() => bottomSheet.current?.present()}
            rippleBorderless
          />
          <BottomSheetModal
            ref={bottomSheet}
            backdropComponent={(props) => <BottomSheetBackdrop {...props} disappearsOnIndex={-1} />}
            index={0}
            snapPoints={[200, '90%']}
            enablePanDownToClose
            enableDismissOnClose
          >
            <BottomSheetScrollView>
              {secondary?.({ size })}
            </BottomSheetScrollView>
          </BottomSheetModal>
        </>
      )}
      {primary?.({ size })}
    </View>
  )
}

export type PrimaryProps = React.PropsWithChildren<{
  style?: StyleProp<ViewStyle>
}>;
ActionMenu.Primary = function({ children, style }: PrimaryProps) {
  const styles = useThemedStyles()
  return (
    <View style={[ styles.actionPrimary, style ]}>
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
ActionMenu.Secondary = function({ label, icon, iconContainerStyle, onPress, disabled }: SecondaryProps) {
  const theme = useTheme()
  const styles = useThemedStyles()
  let iconRender = null
  
  if (icon) {
    if (typeof icon === 'function') {
      iconRender = icon()
    }
    else {
      iconRender = (
        <IconRaw
          family={icon.family}
          name={icon.name}
          size={icon.size ?? 24}
          color={icon.color || (disabled ? theme.colors.textDisabled : theme.colors.textPrimary)}
        />
      )
    }
  }
  
  return (
    <TouchableRipple style={styles.actionSecondary} {...{ onPress, disabled }}>
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
}

const useThemedStyles = createThemedStylesHook(({ consts }) => StyleSheet.create({
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
