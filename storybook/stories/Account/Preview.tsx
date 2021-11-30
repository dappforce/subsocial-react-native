import React from 'react'
import { StyleProp, View, ViewStyle } from 'react-native'
import { useCreateReloadProfile, useSelectProfile } from 'src/rtk/app/hooks'
import { AccountId } from 'src/types/subsocial'
import { useInit } from '~comps/hooks'
import { Head } from './Account'

export type PreviewProps = {
  id: AccountId
  showFollowButton?: boolean
  containerStyle?: StyleProp<ViewStyle>
}
export const Preview = React.memo(({ id, showFollowButton = true, containerStyle }: PreviewProps) => {
  const data = useSelectProfile(id)
  const reloadProfile = useCreateReloadProfile()
  
  useInit(async () => {
    if (data) return true
    
    if (!reloadProfile) return false
    
    reloadProfile({ id })
    return true
  }, [ id ], [ reloadProfile ])
  
  return (
    <View style={containerStyle}>
      <Head
        id={id}
        name={data?.content?.name ?? id.toString()}
        avatar={data?.content?.avatar}
        numFollowers={data?.struct?.followersCount ?? 0}
        numFollowing={data?.struct?.followingAccountsCount ?? 0}
        showFollowButton={showFollowButton}
      />
    </View>
  )
})
