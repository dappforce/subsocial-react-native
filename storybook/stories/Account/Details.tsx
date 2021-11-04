import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { Dimensions, StyleProp, StyleSheet, View, ViewStyle } from 'react-native'
import { TabBar, TabView } from 'react-native-tab-view'
import { AccountId } from 'src/types/subsocial'
import { useCreateReloadProfile, useSelectProfile } from 'src/rtk/app/hooks'
import { Theme, useTheme } from '~comps/Theming'
import { Balance, Header } from '~stories/Misc'
import { Text } from '~comps/Typography'
import { FollowButton } from '~stories/Actions'
import { Address } from './Address'
import { Posts, PostsProps } from './Posts'
import { Comments, CommentsProps } from './Comments'
import { Upvotes, UpvotesProps } from './Upvotes'
import { Follows, FollowsProps } from './Follows'

export type DetailsProps = {
  id: AccountId
  containerStyle?: StyleProp<ViewStyle>
}

export function Details({ id, containerStyle }: DetailsProps) {
  const theme = useTheme()
  const styles = createStyles(theme)
  
  const [ index, setIndex ] = useState(0)
  const routes = useMemo(() => [
    { key: 'posts', title: 'Posts' },
    { key: 'comments', title: 'Comments' },
    { key: 'upvotes', title: 'Upvotes' },
    { key: 'follows', title: 'Follows' },
  ], [])
  
  return (
    <View style={[styles.container, containerStyle]}>
      <DetailsHeader id={id} style={styles.padded} />
      <TabView
        navigationState={{ index, routes }}
        renderTabBar={(props) => (
          <TabBar
            {...props}
            indicatorStyle={styles.tabIndicator}
            labelStyle={styles.tabLabel}
            activeColor={theme.colors.primary}
            inactiveColor={theme.colors.textSecondary}
            style={styles.tabBar}
          />
        )}
        renderScene={({ route }) => {
          switch (route.key) {
            case 'posts':    return <AccountPosts    id={id} />
            case 'comments': return <AccountComments id={id} />
            case 'upvotes':  return <AccountUpvotes  id={id} />
            case 'follows':  return <AccountFollows  id={id} />
            default: return null
          }
        }}
        onIndexChange={setIndex}
        initialLayout={{ width: Dimensions.get('window').width }}
      />
    </View>
  )
}

export type DetailsHeaderProps = {
  id: AccountId
  style?: StyleProp<ViewStyle>
}

export function DetailsHeader({ id, style }: DetailsHeaderProps) {
  const theme = useTheme()
  const styles = createStyles(theme)
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
    <View style={style}>
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


const AccountPosts    = React.memo((props: PostsProps) => <Posts {...props} />)
const AccountComments = React.memo((props: CommentsProps) => <Comments {...props} />)
const AccountUpvotes  = React.memo((props: UpvotesProps) => <Upvotes {...props} />)
const AccountFollows  = React.memo((props: FollowsProps) => <Follows {...props} />)


const createStyles = ({colors, fonts}: Theme) => StyleSheet.create({
  container: {
    flex: 1,
  },
  padded: {
    padding: 10,
  },
  
  tabBar: {
    backgroundColor: colors.background,
  },
  tabIndicator: {
    backgroundColor: colors.primary,
  },
  tabLabel: {
    textTransform: 'none',
  },
  
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
    fontFamily: 'RobotoMedium',
    color: colors.textPrimary,
    marginRight: 4,
  },
  
  balance: {
    ...fonts.secondary,
    fontFamily: 'RobotoMedium',
    color: colors.textSecondary,
  },
})
