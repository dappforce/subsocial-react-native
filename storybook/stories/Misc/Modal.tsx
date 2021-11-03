import React, { useMemo } from 'react'
import { Modal as RNModal, ModalProps as RNModalProps, Pressable, StyleProp, StyleSheet, TextStyle, View, ViewStyle } from 'react-native'
import { Icon } from '~comps/Icon'
import { Theme, useTheme } from '~comps/Theming'
import { Title } from '~comps/Typography'

export type ModalProps = RNModalProps & {
  title?: string
  containerStyle?: StyleProp<ViewStyle>
  contentContainerStyle?: StyleProp<ViewStyle>
  contentStyle?: StyleProp<ViewStyle>
  contentTitleContainerStyle?: StyleProp<ViewStyle>
  contentTitleStyle?: StyleProp<TextStyle>
  minWidth?: TextStyle['minWidth']
  maxWidth?: TextStyle['maxWidth']
}

export function Modal({
  children,
  title,
  containerStyle,
  contentContainerStyle,
  contentStyle,
  contentTitleContainerStyle,
  contentTitleStyle,
  minWidth = 180,
  maxWidth = '80%',
  ...props
}: ModalProps)
{
  const theme = useTheme()
  const styles = useMemo(() => createStyles(theme), [ theme ])
  const { onRequestClose } = props
  
  return (
    <RNModal
      transparent={true}
      animationType="fade"
      {...props}
    >
      <Pressable style={[styles.container, containerStyle]} onPress={(evt) => {if (!evt.isDefaultPrevented()) onRequestClose?.()}}>
        <Pressable
          style={[styles.content, {minWidth, maxWidth}, contentContainerStyle]}
          onPress={(evt) => evt.preventDefault()}
          android_disableSound
          accessibilityRole="none"
        >
          <View style={[styles.contentTitleContainer, contentTitleContainerStyle]} accessibilityRole="header">
            <Title preview style={contentTitleStyle}>{title}</Title>
            <Icon
              family="ionicon"
              name="close-outline"
              size={20}
              onPress={onRequestClose}
              rippleBorderless
              rippleSize={16}
              accessibilityLabel="Close modal"
              accessibilityRole="button"
            />
          </View>
          <View style={contentStyle}>
            {children}
          </View>
        </Pressable>
      </Pressable>
    </RNModal>
  )
}

const createStyles = ({colors}: Theme) => StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.backdrop,
  },
  content: {
    backgroundColor: colors.background,
    padding: 14,
    borderRadius: 10,
  },
  contentTitleContainer: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
})
