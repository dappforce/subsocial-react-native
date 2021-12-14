import React from 'react'
import { StyleProp, StyleSheet, View, ViewStyle } from 'react-native'
import { useSelectKeypair } from 'src/rtk/app/hooks'
import { PostId } from 'src/types/subsocial'
import { Icon } from '~comps/Icon'
import { IpfsAvatar, MyIpfsAvatar } from '~comps/IpfsImage'
import { useTheme } from '~comps/Theming'

export type ReplyInputProps = {
  postId: PostId
}

export const ReplyInput = React.memo(({ postId }: ReplyInputProps) => {
  const theme = useTheme()
  const { address } = useSelectKeypair() ?? {}
  
  return (
    <View style={styles.container}>
      <MyIpfsAvatar size={30} color={theme.colors.divider} />
    </View>
  )
})

const styles = StyleSheet.create({
  container: {
    display: 'flex',
    flexDirection: 'row',
    paddingTop: 10,
    paddingHorizontal: 20,
  },
})
