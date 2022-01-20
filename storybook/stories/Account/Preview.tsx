import React, { ReactNode } from 'react'
import { StyleProp, View, ViewStyle } from 'react-native'
import { useCreateReloadProfile, useSelectProfile } from 'src/rtk/app/hooks'
import { AccountId } from 'src/types/subsocial'
import { useInit } from '~comps/hooks'
import { getDisplayName } from './util'
import { Head, HeadProps } from './Account'

export type PreviewProps = {
  id: AccountId
  showFollowButton?: boolean
  actionMenu?: () => ReactNode
  actions?: HeadProps['actions']
  containerStyle?: StyleProp<ViewStyle>
}
export const Preview = React.memo(({ id, showFollowButton = true, actionMenu, actions, containerStyle }: PreviewProps) => {
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
        name={getDisplayName(id, data)}
        avatar={data?.content?.avatar}
        actionMenu={actionMenu}
        actions={actions}
        numFollowers={data?.struct?.followersCount ?? 0}
        numFollowing={data?.struct?.followingAccountsCount ?? 0}
        showFollowButton={showFollowButton}
      />
    </View>
  )
})
