//////////////////////////////////////////////////////////////////////
// Data-driven Action Panel consisting of Icons & optional labels,
// e.g. underneath a post
import React from 'react'
import { StyleProp, StyleSheet, TextStyle, View, ViewStyle } from 'react-native'
import { Icon } from 'react-native-elements'
import { useTheme } from 'src/components/Theming'
import { Text } from 'src/components/Typography'
import { IconFamily } from 'src/util'

export type PanelProps = React.PropsWithChildren<{
  style?: StyleProp<ViewStyle>
}>
export function Panel({children, style}: PanelProps) {
  return (
    <View style={[styles.container, style]}>
      {children}
    </View>
  )
}

export type PanelItemProps = {
  icon: string
  iconFamily: IconFamily
  label?: string | number
  color?: string
  onPress?: () => void
  containerStyle?: StyleProp<TextStyle>
  labelStyle?: StyleProp<TextStyle>
};
Panel.Item = ({icon, iconFamily, label, color, onPress, containerStyle, labelStyle}: PanelItemProps) => {
  const theme = useTheme()
  
  return (
    <View style={[styles.item, containerStyle]}>
      <Icon name={icon} type={iconFamily} color={color ?? theme.colors.socials} onPress={onPress} />
      {!!label && <Text mode="secondary" style={[styles.label, labelStyle]}>{label+''}</Text>}
    </View>
  )
}

type PanelLikeItemProps = {
  liked: boolean
  likesCount: number
  onPress?: () => void
};
Panel.LikeItem = ({liked, likesCount, onPress}: PanelLikeItemProps) => {
  const theme = useTheme()
  return (
    <Panel.Item
      icon={liked ? 'heart' : 'heart-outline'}
      iconFamily="ionicon"
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
Panel.ReplyItem = ({replyCount, onPress}: PanelReplyItemProps) => {
  return (
    <Panel.Item
      icon="chatbubble-ellipses-outline"
      iconFamily="ionicon"
      label={replyCount}
      onPress={onPress}
    />
  )
}

Panel.ShareItem = ({onPress}: {onPress?: () => void}) => <Panel.Item icon="share-social-outline" iconFamily="ionicon" onPress={onPress} />

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
    marginHorizontal: 4,
  },
});
