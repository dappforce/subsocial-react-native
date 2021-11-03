import React, { useCallback, useEffect } from 'react'
import { StyleProp, StyleSheet, View, ViewStyle } from 'react-native'
import { AccountId } from 'src/types/subsocial'
import { useCreateReloadProfile, useSelectProfile } from 'src/rtk/app/hooks'
import { Theme, useTheme } from '~comps/Theming'
import { Balance, Header } from '~stories/Misc'
import { Text } from '~comps/Typography'
import { FollowButton } from '~stories/Actions'
import { Address } from './Address'

export type DetailsProps = {
  id: AccountId
  containerStyle?: StyleProp<ViewStyle>
}
export function Details({id, containerStyle}: DetailsProps) {
  const theme = useTheme()
  const styles = createThemedStyles(theme)
  const data = useSelectProfile(id)
  const reloadProfile = useCreateReloadProfile()
  
  // TODO: Follow logic :')
  const renderFollowButton = useCallback(() => {
    return (
      <FollowButton
        id={id}
        isFollowing={false}
        onPress={() => alert('not yet implemented')}
      />
    )
  }, [ id ])
  
  useEffect(() => {
    if (!data) reloadProfile?.({ id })
  }, [ id, reloadProfile ])
  
  return (
    <View style={containerStyle}>
      <Header
        title={data?.content?.name ?? id}
        subtitle={
          <Balance
            address={id}
            truncate={2}
            integerBalanceStyle={styles.balance}
            decimalBalanceStyle={styles.balance}
            currencyStyle={styles.balance}
          />
        }
        avatar={data?.content?.avatar}
        actionMenuProps={{
          primary: renderFollowButton
        }}
      />
      <View style={styles.followage}>
        <Text mode="secondary" style={styles.followageCount}>{data?.struct?.followingAccountsCount ?? 0}</Text>
        <Text mode="secondary" style={styles.followageLabel}>Following</Text>
        
        <Text mode="secondary" style={styles.followageCount}>{data?.struct?.followersCount ?? 0}</Text>
        <Text mode="secondary" style={styles.followageLabel}>Followers</Text>
      </View>
      {!!data?.content?.about && <Text style={styles.about}>{data?.content?.about}</Text>}
      <Address id={id} />
    </View>
  )
}

const createThemedStyles = ({colors, fonts}: Theme) => StyleSheet.create({
  about: {
    marginBottom: 10,
  },
  
  followage: {
    display: 'flex',
    flexDirection: 'row',
    marginBottom: 10,
  },
  followageLabel: {
    color: colors.textSecondary,
    marginRight: 10,
  },
  followageCount: {
    fontFamily: 'Roboto500',
    color: colors.textPrimary,
    marginRight: 4,
  },
  
  balance: {
    ...fonts.secondary,
    fontFamily: 'Roboto500',
    color: colors.textSecondary,
  },
})
