//////////////////////////////////////////////////////////////////////
// Main Screen consisting of Bottom Tabs navigation
import React from 'react'
import { StyleSheet, View } from 'react-native'
import { BottomTabNavigationProp, BottomTabScreenProps, createBottomTabNavigator, BottomTabBar, BottomTabBarProps } from '@react-navigation/bottom-tabs'
import { createThemedStylesHook, useTheme } from '~comps/Theming'
import { useLoadKeypair, useSelectReplyTo } from 'src/rtk/app/hooks'
import { BottomTabHeader } from '~stories/Misc/NavHeader'
import { ExploreScreen } from './ExploreScreen'
import { Text } from '~comps/Typography'
import { Icon } from '~comps/Icon'
import { MyIpfsAvatar } from '~comps/IpfsImage'
import { MyAccountDetails } from '~stories/Account'
import Elevations from 'react-native-elevation'
import { EventListenerCallback } from '@react-navigation/native'
import { BottomTabNavigationEventMap } from '@react-navigation/bottom-tabs/lib/typescript/src/types'
import { ReplyInput } from '~stories/Comments'

export type Routes = {
  Home: {}
  Search: {}
  Notifications: {}
  Profile: {}
}

export type MainNavigationProp = BottomTabNavigationProp<Routes>
export type MainNavScreenProps<S extends keyof Routes> = BottomTabScreenProps<Routes, S>

const Tabs = createBottomTabNavigator<Routes>()

type TabPressCallback = EventListenerCallback<BottomTabNavigationEventMap, 'tabPress'>

export type MainScreenProps = {
  
}
export function MainScreen({}: MainScreenProps) {
  const theme = useTheme()
  useLoadKeypair()
  
  return (
    <Tabs.Navigator
      backBehavior="history"
      detachInactiveScreens
      tabBar={(props) => <MainScreenTabBar {...props} />}
      screenOptions={{
        tabBarShowLabel: false,
        tabBarActiveTintColor: theme.colors.primary,
        tabBarInactiveTintColor: theme.colors.divider,
        tabBarStyle: {
          backgroundColor: theme.colors.backgroundMenu,
          borderTopWidth: 0,
          ...Elevations[0],
        },
        header: BottomTabHeader,
      }}
    >
      <Tabs.Screen
        name="Home"
        component={ExploreScreen}
        options={{
          tabBarIcon: renderHomeIcon,
          headerShown: false,
        }}
      />
      <Tabs.Screen
        name="Search"
        component={TempSearchScreen}
        options={{
          tabBarIcon: renderSearchIcon,
        }}
      />
      <Tabs.Screen
        name="Notifications"
        component={TempNotifScreen}
        options={{
          tabBarIcon: renderNotifIcon,
        }}
      />
      <Tabs.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          title: 'My Profile',
          tabBarIcon: (props) => <MyIpfsAvatar {...props} />,
        }}
      />
    </Tabs.Navigator>
  )
}

const MainScreenTabBar = React.memo((props: BottomTabBarProps) => {
  const styles = useThemedStyles()
  const replyTo = useSelectReplyTo()
  
  return (
    <View style={styles.tabBar}>
      {!!replyTo && <ReplyInput postId={replyTo} />}
      <BottomTabBar {...props} />
    </View>
  )
})

function TempSearchScreen({}: MainNavScreenProps<'Search'>) {
  const styles = useThemedStyles()
  
  return (
    <View style={styles.centered}>
      <Text>This should be search screen</Text>
    </View>
  )
}

function TempNotifScreen({}: MainNavScreenProps<'Notifications'>) {
  const styles = useThemedStyles()
  
  return (
    <View style={styles.centered}>
      <Text>This should be notifications screen</Text>
    </View>
  )
}

const ProfileScreen = React.memo(({}: MainNavScreenProps<'Profile'>) => {
  return <MyAccountDetails />
})

const useThemedStyles = createThemedStylesHook(({ colors }) => StyleSheet.create({
  tabBar: {
    backgroundColor: colors.backgroundMenu,
    borderTopColor: colors.line,
    borderTopWidth: 1,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
}))


type TabBarIconProps = {
  focused: boolean
  color: string
  size: number
}

const renderHomeIcon = ({ color, size }: TabBarIconProps) => {
  return <Icon family="ionicon" name="home-outline" color={color} size={size} />
}

const renderSearchIcon = ({ color, size }: TabBarIconProps) => {
  return <Icon family="ionicon" name="search-outline" color={color} size={size} />
}

const renderNotifIcon = ({ color, size }: TabBarIconProps) => {
  return <Icon family="ionicon" name="notifications-outline" color={color} size={size} />
}
