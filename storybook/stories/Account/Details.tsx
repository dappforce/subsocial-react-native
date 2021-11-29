import React, { useCallback, useMemo, useState } from 'react'
import { LayoutChangeEvent, StyleProp, StyleSheet, View, ViewStyle } from 'react-native'
import {
  createMaterialTopTabNavigator,
  MaterialTopTabBarProps,
  MaterialTopTabBar,
  MaterialTopTabNavigationProp,
  MaterialTopTabScreenProps
} from '@react-navigation/material-top-tabs'
import { AccountId } from 'src/types/subsocial'
import { useCreateReloadProfile, useSelectKeypair, useSelectProfile } from 'src/rtk/app/hooks'
import { createThemedStylesHook, Theme, useTheme } from '~comps/Theming'
import { Balance, Header } from '~stories/Misc'
import { Divider, Text } from '~comps/Typography'
import { FollowAccountButton } from '~stories/Actions'
import { DetailsHeaderProvider, useDetailsHeader } from './DetailsHeaderContext'
import { Address } from './Address'
import { Posts } from './Posts'
import { Comments } from './Comments'
import { Upvotes } from './Upvotes'
import { Follows } from './Follows'
import { Spaces } from './Spaces'
import Elevations from 'react-native-elevation'
import Collapsible from 'react-native-collapsible'
import { useInit } from '~comps/hooks'

export type DetailsRoutes = {
  posts:    {}
  comments: {}
  upvotes:  {}
  follows:  {}
  spaces:   {}
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
  
  const AccountPosts    = useMemo(() => ({}: {}) => <WrappedPosts    id={id} />, [ id ])
  const AccountComments = useMemo(() => ({}: {}) => <WrappedComments id={id} />, [ id ])
  const AccountUpvotes  = useMemo(() => ({}: {}) => <WrappedUpvotes  id={id} />, [ id ])
  const AccountFollows  = useMemo(() => ({}: {}) => <WrappedFollows  id={id} />, [ id ])
  const AccountSpaces   = useMemo(() => ({}: {}) => <WrappedSpaces   id={id} />, [ id ])
  
  return (
    <DetailsHeaderProvider>
      <Tabs.Navigator
        tabBar={(props: MaterialTopTabBarProps) => <DetailsTabBar id={id} {...props} />}
        screenOptions={{
          tabBarStyle: styles.tabBar,
          tabBarLabelStyle: styles.tabLabel,
          tabBarInactiveTintColor: theme.colors.textSecondary,
          tabBarActiveTintColor: theme.colors.primary,
          tabBarItemStyle: styles.tabItem,
          tabBarScrollEnabled: true,
          lazy: true,
          lazyPreloadDistance: 0, // do not preload, because loading a single tab takes long enough
        }}
      >
        <Tabs.Screen name='posts'    component={AccountPosts}    options={{ tabBarLabel: 'Posts' }}    />
        <Tabs.Screen name='comments' component={AccountComments} options={{ tabBarLabel: 'Comments' }} />
        <Tabs.Screen name='upvotes'  component={AccountUpvotes}  options={{ tabBarLabel: 'Upvotes' }}  />
        <Tabs.Screen name='follows'  component={AccountFollows}  options={{ tabBarLabel: 'Follows' }}  />
        <Tabs.Screen name='spaces'   component={AccountSpaces}   options={{ tabBarLabel: 'Spaces' }}   />
      </Tabs.Navigator>
    </DetailsHeaderProvider>
  )
}

export type DetailsHeaderProps = {
  id: AccountId
  style?: StyleProp<ViewStyle>
  onLayout?: (event: LayoutChangeEvent) => void
}

export function DetailsHeader({ id, style, onLayout }: DetailsHeaderProps) {
  const { address: myAddress } = useSelectKeypair() ?? {}
  const isMyAccount = myAddress === id
  const styles = useThemedStyle()
  const data = useSelectProfile(id)
  const reloadProfile = useCreateReloadProfile()
  
  const renderFollowButton = useCallback(() => <FollowAccountButton id={id} />, [ id ])
  
  useInit(async () => {
    if (!reloadProfile) return false
    
    if (!data) await reloadProfile({ id })
    return true
  }, [ id ], [ reloadProfile ])
  
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
          primary: !isMyAccount ? renderFollowButton : undefined,
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
  const { collapsed } = useDetailsHeader()
  
  const [ headerHeight, setHeaderHeight ] = useState(0)
  
  const onHeaderLayout = useCallback((event: LayoutChangeEvent) => {
    const { height } = event.nativeEvent.layout
    setHeaderHeight(height)
  }, [])
  
  return (
    <>
      <Collapsible collapsed={collapsed}>
        <DetailsHeader id={id} style={styles.header} onLayout={onHeaderLayout} />
      </Collapsible>
      <MaterialTopTabBar {...props} />
      <Divider />
    </>
  )
}


type CommonDetailsScreenProps = {
  id: AccountId
}

const WrappedPosts = React.memo(({ id }: CommonDetailsScreenProps) => {
  const { onScroll, onScrollBeginDrag, onScrollEndDrag } = useDetailsHeader()
  return <Posts {...{ id, onScroll, onScrollBeginDrag, onScrollEndDrag }} />
})
const WrappedComments = React.memo(({ id }: CommonDetailsScreenProps) => {
  const { onScroll, onScrollBeginDrag, onScrollEndDrag } = useDetailsHeader()
  return <Comments {...{ id, onScroll, onScrollBeginDrag, onScrollEndDrag }} />
})
const WrappedUpvotes = React.memo(({ id }: CommonDetailsScreenProps) => {
  const { onScroll, onScrollBeginDrag, onScrollEndDrag } = useDetailsHeader()
  return <Upvotes {...{ id, onScroll, onScrollBeginDrag, onScrollEndDrag }} />
})
const WrappedFollows = React.memo(({ id }: CommonDetailsScreenProps) => {
  const { onScroll, onScrollBeginDrag, onScrollEndDrag } = useDetailsHeader()
  return <Follows {...{ id, onScroll, onScrollBeginDrag, onScrollEndDrag }} />
})
const WrappedSpaces = React.memo(({ id }: CommonDetailsScreenProps)   => {
  const { onScroll, onScrollBeginDrag, onScrollEndDrag } = useDetailsHeader()
  return <Spaces {...{ id, onScroll, onScrollBeginDrag, onScrollEndDrag }} />
})


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
  tabItem: {
    width: 100,
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
