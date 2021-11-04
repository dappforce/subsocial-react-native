//////////////////////////////////////////////////////////////////////
// Standardized Header above Posts, Users, Spaces. Used to use
// RNP Card.Title, but it has some bothersome nuances which this
// implementation avoids.
// Plus, our specialization allows us to simplify things a bit more. ;)
import React from 'react'
import { GestureResponderEvent, StyleProp, StyleSheet, TextStyle, View, ViewStyle } from 'react-native'
import { Text } from '~comps/Typography'
import { IpfsAvatar } from '~comps/IpfsImage'
import { ActionMenu, ActionMenuProps } from '~stories/Actions'

export type HeaderProps = {
  title: string | React.ReactElement
  titleStyle?: StyleProp<TextStyle>
  subtitle: string | React.ReactElement
  subtitleStyle?: StyleProp<TextStyle>
  avatar?: string // CID
  avatarSize?: number
  actionMenuProps?: ActionMenuProps
  containerStyle?: StyleProp<ViewStyle>
  onPressAvatar?:   (evt: GestureResponderEvent) => void
  onPressTitle?:    (evt: GestureResponderEvent) => void
  onPressSubtitle?: (evt: GestureResponderEvent) => void
}
export function Header({
  title,
  titleStyle,
  subtitle,
  subtitleStyle,
  avatar,
  avatarSize = 40,
  actionMenuProps,
  containerStyle,
  onPressAvatar,
  onPressTitle,
  onPressSubtitle,
}: HeaderProps)
{
  return (
    <View style={[ styles.container, containerStyle ]}>
      <View style={styles.left}>
        <IpfsAvatar
          cid={avatar}
          onPress={onPressAvatar}
          size={avatarSize}
        />
      </View>
      <View style={styles.center}>
        <View style={styles.titleContainer}>
          {typeof title === 'string'
          ? <Text
              style={[styles.title, titleStyle]}
              mode="primary"
              onPress={onPressTitle}
              numberOfLines={1}
            >
              {title}
            </Text>
          : title
          }
        </View>
        <View style={styles.subtitleContainer}>
          {typeof subtitle === 'string'
          ? <Text
              style={[styles.subtitle, subtitleStyle]}
              mode="secondary"
              onPress={onPressSubtitle}
              numberOfLines={1}
            >
              {subtitle}
            </Text>
          : subtitle
          }
        </View>
      </View>
      <View style={styles.right}>
        <ActionMenu {...actionMenuProps} />
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  left: {
    marginRight: 10,
  },
  right: {
    marginLeft: 10,
  },
  center: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
  },
  titleContainer: {
    
  },
  title: {
    fontFamily: 'RobotoMedium',
  },
  subtitleContainer: {
    
  },
  subtitle: {
    
  },
});
