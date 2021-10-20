//////////////////////////////////////////////////////////////////////
// ActionPanel underneath a post
import React from 'react'
import { StyleSheet, View } from 'react-native'
import { Icon, IconProps } from 'react-native-elements'
import { useTheme } from 'src/components/Theming'
import { Text } from 'src/components/Typography'
import { IconFamily } from 'src/util'

export type ActionPanelProps = {
  liked: boolean
  numLikes: number
  numComments: number
  onPressLike: () => void
  onPressComment: () => void
  onPressShare: () => void
}
export function ActionPanel({liked, numLikes, numComments, onPressLike, onPressComment, onPressShare}: ActionPanelProps) {
  const theme = useTheme();
  
  return (
    <View style={styles.container}>
      <View style={styles.group}>
        <Icon name={liked ? 'heart' : 'heart-outline'} type="ionicon" color={liked ? 'red' : theme.colors.socials} onPress={()=>onPressLike()} />
        {numLikes>0 && <Text mode="secondary" style={styles.label}>{numLikes+''}</Text>}
      </View>
      <View style={styles.group}>
        <Icon name="chatbubble-ellipses-outline" type="ionicon" color={theme.colors.socials} onPress={()=>onPressComment()} />
        {numComments>0 && <Text mode="secondary" style={styles.label}>{numComments+''}</Text>}
      </View>
      <Icon name="share-social-outline" type="ionicon" color={theme.colors.socials} onPress={()=>onPressShare()} />
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    marginTop: 10,
  },
  group: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
  },
  label: {
    marginHorizontal: 4,
  },
});
