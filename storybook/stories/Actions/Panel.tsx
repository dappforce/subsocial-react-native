//////////////////////////////////////////////////////////////////////
// Data-driven Action Panel consisting of Icons & optional labels,
// e.g. underneath a post
import React from 'react'
import { StyleProp, StyleSheet, TextStyle, View, ViewStyle } from 'react-native'
import { AnyIcon, IconRaw, isAnyIcon } from '~comps/Icon'
import { useTheme } from '~comps/Theming'
import { Text } from '~comps/Typography'
import SubIcon from 'assets/sub-icon.svg'

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
  onPress?: () => void
  containerStyle?: StyleProp<TextStyle>
  labelStyle?: StyleProp<TextStyle>
};
Panel.Item = ({ icon, label, color, onPress, containerStyle, labelStyle }: PanelItemProps) => {
  const theme = useTheme()
  
  const _icon = isAnyIcon(icon)
    ? <IconRaw
        name={icon.name}
        family={icon.family}
        color={color ?? theme.colors.socials}
        onPress={onPress}
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

type PanelLikeItemProps = {
  liked: boolean
  likesCount: number
  onPress?: () => void
};
Panel.LikeItem = ({ liked, likesCount, onPress }: PanelLikeItemProps) => {
  const theme = useTheme()
  return (
    <Panel.Item
      icon={{
        family: 'ionicon',
        name: liked ? 'heart' : 'heart-outline',
      }}
      label={likesCount}
      color={liked ? theme.colors.primary : undefined} // undefined defaults to theme color
      onPress={onPress}
    />
  )
}

type PanelReplyItemProps = {
  replyCount: number
  onPress?: () => void
};
Panel.ReplyItem = ({ replyCount, onPress }: PanelReplyItemProps) => {
  return (
    <Panel.Item
      icon={{
        family: 'ionicon',
        name: 'chatbubble-ellipses-outline',
      }}
      label={replyCount}
      onPress={onPress}
    />
  )
}

type PanelShareItemProps = {
  onPress?: () => void
  label?: string | number | true
};
Panel.ShareItem = ({ label, onPress }: PanelShareItemProps) => {
  label = label || ''
  
  return (
    <Panel.Item
      icon={{
        family: 'ionicon',
        name: 'arrow-redo-outline',
      }}
      label={label === true ? 'Share' : label+''}
      onPress={onPress}
    />
  )
}

type PanelTipItemProps = {
  onPress?: () => void
};
Panel.TipItem = ({ onPress }: PanelTipItemProps) => {
  const ICON_SIZE = 20
  
  return (
    <Panel.Item
      icon={<SubIcon width={ICON_SIZE} height={ICON_SIZE} />}
      onPress={onPress}
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
