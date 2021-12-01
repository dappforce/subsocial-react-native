//////////////////////////////////////////////////////////////////////
// Data-driven Action Panel consisting of Icons & optional labels,
// e.g. underneath a post
import React, { useCallback } from 'react'
import { Share, StyleProp, StyleSheet, TextStyle, View, ViewStyle } from 'react-native'
import Constants from 'expo-constants'
import { AnyIcon, IconRaw, isAnyIcon } from '~comps/Icon'
import { useTheme } from '~comps/Theming'
import { Text } from '~comps/Typography'
import SubIcon from 'assets/sub-icon.svg'

export class ShareEvent {
  #isDefaultPrevented = false
  
  constructor(public readonly message: string, public readonly url: string) {}
  
  preventDefault() {
    this.#isDefaultPrevented = true
  }
  
  get isDefaultPrevented() {
    return this.#isDefaultPrevented
  }
}

export type PanelProps = React.PropsWithChildren<{
  style?: StyleProp<ViewStyle>
}>
export function Panel({ children, style }: PanelProps) {
  return (
    <View style={[ styles.container, style ]}>
      {children}
    </View>
  )
}

export type PanelItemProps = {
  icon: AnyIcon | React.ReactElement
  label?: string | number
  color?: string
  disabled?: boolean
  onPress?: () => void
  containerStyle?: StyleProp<TextStyle>
  labelStyle?: StyleProp<TextStyle>
};
Panel.Item = ({ icon, label, color, disabled, onPress, containerStyle, labelStyle }: PanelItemProps) => {
  const theme = useTheme()
  
  const _icon = isAnyIcon(icon)
    ? <IconRaw
        name={icon.name}
        family={icon.family}
        color={disabled ? theme.colors.textDisabled : (color ?? theme.colors.socials)}
        onPress={!disabled ? onPress : undefined}
        size={20}
        rippleBorderless
        rippleSize={16}
      />
    : icon
  
  return (
    <View style={[ styles.item, containerStyle ]}>
      {_icon}
      {!!label && <Text mode="secondary" style={[ styles.label, labelStyle ]}>{label+''}</Text>}
    </View>
  )
}

export type PanelLikeItemProps = Omit<PanelItemProps, 'icon' | 'label' | 'color'> & {
  liked: boolean
  likesCount: number
};
Panel.LikeItem = ({ liked, likesCount, ...props }: PanelLikeItemProps) => {
  const theme = useTheme()
  return (
    <Panel.Item
      {...props}
      icon={{
        family: 'ionicon',
        name: liked ? 'heart' : 'heart-outline',
      }}
      label={likesCount}
      color={liked ? theme.colors.primary : undefined} // undefined defaults to theme color
    />
  )
}

export type PanelReplyItemProps = Omit<PanelItemProps, 'icon' | 'label'> & {
  replyCount: number
};
Panel.ReplyItem = ({ replyCount, ...props }: PanelReplyItemProps) => {
  return (
    <Panel.Item
      {...props}
      icon={{
        family: 'ionicon',
        name: 'chatbubble-ellipses-outline',
      }}
      label={replyCount}
    />
  )
}

export type PanelShareItemProps = Omit<PanelItemProps, 'icon' | 'label' | 'onPress'> & {
  label?: string | number | true
  shareMessage?: string
  shareUrl: string
  onPress?: (event: ShareEvent) => void
  onShare?: (event: ShareEvent) => void
};
Panel.ShareItem = ({
  label,
  shareMessage,
  shareUrl,
  onPress: _onPress,
  onShare,
  ...props
}: PanelShareItemProps) =>
{
  label = label || ''
  shareMessage = shareMessage || 'Hey, check this out on Subsocial!'
  
  const onPress = useCallback(async () => {
    const evt = new ShareEvent(shareMessage as string, shareUrl)
    await _onPress?.(evt)
    
    if (!evt.isDefaultPrevented) {
      if (Constants.platform?.ios) {
        await Share.share({
          message: shareMessage,
          url: shareUrl,
        })
      }
      else {
        await Share.share({ message: `${shareMessage} ${shareUrl}`})
      }
      
      await onShare?.(evt)
    }
  }, [ shareMessage, shareUrl, _onPress ])
  
  return (
    <Panel.Item
      {...props}
      icon={{
        family: 'ionicon',
        name: 'arrow-redo-outline',
      }}
      label={label === true ? 'Share' : label+''}
      onPress={onPress}
    />
  )
}

export type PanelTipItemProps = Omit<PanelItemProps, 'icon' | 'label'> & {
  
};
Panel.TipItem = ({ ...props }: PanelTipItemProps) => {
  const ICON_SIZE = 20
  
  return (
    <Panel.Item
      {...props}
      icon={<SubIcon width={ICON_SIZE} height={ICON_SIZE} />}
    />
  )
}

const styles = StyleSheet.create({
  container: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    marginVertical: 10,
  },
  item: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
  },
  label: {
    fontFamily: 'RobotoMedium',
    marginHorizontal: 4,
  },
})
