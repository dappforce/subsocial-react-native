//////////////////////////////////////////////////////////////////////
// Generic base modal component building upon RN's Modal.
// Because I didn't like the way RNP's Modal was implemented, and RNE
// doesn't have one.
import React, { useCallback, useMemo } from 'react'
import { GestureResponderEvent, Modal as RNModal, ModalProps as RNModalProps, Pressable, StyleProp, StyleSheet, TextStyle, View, ViewStyle } from 'react-native'
import { Icon } from '~comps/Icon'
import { Theme, useTheme } from '~comps/Theming'
import { Title } from '~comps/Typography'

export type ModalProps = RNModalProps & {
  title?: string
  containerStyle?: StyleProp<ViewStyle>
  contentContainerStyle?: StyleProp<ViewStyle>
  contentStyle?: StyleProp<ViewStyle>
  titleContainerStyle?: StyleProp<ViewStyle>
  titleStyle?: StyleProp<TextStyle>
  minWidth?: TextStyle['minWidth']
  maxWidth?: TextStyle['maxWidth']
}

export function Modal({
  children,
  title,
  containerStyle,
  contentContainerStyle,
  contentStyle,
  titleContainerStyle,
  titleStyle,
  minWidth = 180,
  maxWidth = '80%',
  ...props
}: ModalProps)
{
  const theme = useTheme()
  const styles = useMemo(() => createStyles(theme), [ theme ])
  const { onRequestClose } = props
  
  const onPressBackdrop = useCallback((evt: GestureResponderEvent) => {
    if (!evt.isDefaultPrevented()) {
      onRequestClose?.()
    }
  }, [ onRequestClose ])
  
  return (
    <RNModal
      transparent
      animationType="fade"
      {...props}
    >
      <Pressable style={[ styles.container, containerStyle ]} onPress={onPressBackdrop}>
        <Pressable
          style={[ styles.content, { minWidth, maxWidth }, contentContainerStyle ]}
          onPress={(evt) => evt.preventDefault()}
          android_disableSound
          accessibilityRole="none"
        >
          <View style={[ styles.titleContainer, titleContainerStyle ]} accessibilityRole="header">
            <Title preview style={titleStyle}>{title}</Title>
            <Icon
              icon={{
                family: 'ionicon',
                name: 'close-outline',
              }}
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

Modal.PADDING = 16

const createStyles = ({ colors }: Theme) => StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.backdrop,
  },
  content: {
    backgroundColor: colors.background,
    padding: Modal.PADDING,
    borderRadius: 10,
  },
  titleContainer: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    alignSelf: 'stretch',
  },
})
