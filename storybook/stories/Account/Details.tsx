import React, { useCallback, useEffect, useState } from 'react'
import { LayoutChangeEvent, StyleProp, StyleSheet, View, ViewStyle } from 'react-native'
import {
  createMaterialTopTabNavigator,
  MaterialTopTabBarProps,
  MaterialTopTabBar,
  MaterialTopTabNavigationProp,
  MaterialTopTabScreenProps
} from '@react-navigation/material-top-tabs'
import { AccountId } from 'src/types/subsocial'
import { useCreateReloadProfile, useSelectProfile } from 'src/rtk/app/hooks'
import { createThemedStylesHook, Theme, useTheme } from '~comps/Theming'
import { Balance, Header } from '~stories/Misc'
import { Text } from '~comps/Typography'
import { FollowButton } from '~stories/Actions'
import { Address } from './Address'
import { Posts, PostsProps } from './Posts'
import { Comments, CommentsProps } from './Comments'
import { Upvotes, UpvotesProps } from './Upvotes'
import { Follows, FollowsProps } from './Follows'
import Elevations from 'react-native-elevation'

export type DetailsRoutes = {
  posts: { accountId: AccountId }
  comments: { accountId: AccountId }
  upvotes: { accountId: AccountId }
  follows: { accountId: AccountId }
}

export type DetailsNavProps = MaterialTopTabNavigationProp<DetailsRoutes>
export type DetailsScreenProps<S extends keyof DetailsRoutes> = MaterialTopTabScreenProps<DetailsRoutes, S>

const Tabs = createMaterialTopTabNavigator<DetailsRoutes>()

export type DetailsProps = {
  id: AccountId
}

export function Details({ id }: DetailsProps) {
  const theme = useTheme()
  const styles = useThemedStyle()
  
  return (
    <Tabs.Navigator
      tabBar={(props: MaterialTopTabBarProps) => <DetailsTabBar id={id} {...props} />}
      screenOptions={{
        tabBarLabelStyle: styles.tabLabel,
        tabBarInactiveTintColor: theme.colors.textSecondary,
        tabBarActiveTintColor: theme.colors.primary,
        tabBarStyle: styles.tabBar,
      }}
    >
      <Tabs.Screen name='posts'    component={AccountPosts}    options={{ tabBarLabel: 'Posts' }}    initialParams={{ accountId: id }} />
      <Tabs.Screen name='comments' component={AccountComments} options={{ tabBarLabel: 'Comments' }} initialParams={{ accountId: id }} />
      <Tabs.Screen name='upvotes'  component={AccountUpvotes}  options={{ tabBarLabel: 'Upvotes' }}  initialParams={{ accountId: id }} />
      <Tabs.Screen name='follows'  component={AccountFollows}  options={{ tabBarLabel: 'Follows' }}  initialParams={{ accountId: id }} />
    </Tabs.Navigator>
  )
}

export type DetailsHeaderProps = {
  id: AccountId
  style?: StyleProp<ViewStyle>
  onLayout?: (event: LayoutChangeEvent) => void
}

export function DetailsHeader({ id, style, onLayout }: DetailsHeaderProps) {
  const styles = useThemedStyle()
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
    <View {...{style, onLayout}}>
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


type DetailsTabBarProps = MaterialTopTabBarProps & {
  id: AccountId
}
function DetailsTabBar({ id, ...props }: DetailsTabBarProps) {
  const styles = useThemedStyle()
  
  const [ headerHeight, setHeaderHeight ] = useState(0)
  
  const onHeaderLayout = useCallback((event: LayoutChangeEvent) => {
    const { height } = event.nativeEvent.layout
    setHeaderHeight(height)
  }, [])
  console.log(headerHeight)
  
  return (
    <>
      <DetailsHeader id={id} style={styles.header} onLayout={onHeaderLayout} />
      <MaterialTopTabBar {...props} />
    </>
  )
}


const AccountPosts    = React.memo((props: PostsProps) => <Posts {...props} />)
const AccountComments = React.memo((props: CommentsProps) => <Comments {...props} />)
const AccountUpvotes  = React.memo((props: UpvotesProps) => <Upvotes {...props} />)
const AccountFollows  = React.memo((props: FollowsProps) => <Follows {...props} />)


const useThemedStyle = createThemedStylesHook(({ colors, fonts }: Theme) => StyleSheet.create({
  container: {
    flex: 1,
  },
  padded: {
    padding: 10,
  },
  
  header: {
    margin: 20,
    marginBottom: 0,
  },
  tabBar: {
    backgroundColor: colors.background,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.divider,
    ...Elevations[0],
  },
  tabLabel: {
    ...fonts.secondary,
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
}))
