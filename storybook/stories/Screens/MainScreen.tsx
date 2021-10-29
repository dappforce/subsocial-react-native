//////////////////////////////////////////////////////////////////////
// Main Screen consisting of Bottom Tabs navigation
import React, { useEffect } from 'react'
import { StyleSheet, View } from 'react-native'
import { BottomTabNavigationProp, BottomTabScreenProps, createBottomTabNavigator } from '@react-navigation/bottom-tabs'
import { Icon } from 'react-native-elements'
import { useTheme } from '~comps/Theming'
import { BottomTabHeader } from '~stories/Misc/NavHeader'
import { ExploreScreen } from './ExploreScreen'
import { Text } from '~comps/Typography'

export type Routes = {
  Home: {}
  Search: {}
  Notifications: {}
  Profile: {}
}

export type MainNavigationProp = BottomTabNavigationProp<Routes>
export type MainNavScreenProps<S extends keyof Routes> = BottomTabScreenProps<Routes, S>

const Tabs = createBottomTabNavigator<Routes>()

export type MainScreenProps = {
  
}
export function MainScreen({}: MainScreenProps) {
  const theme = useTheme()
  
  return (
    <Tabs.Navigator
      backBehavior="history"
      detachInactiveScreens
      screenOptions={{
        tabBarShowLabel: false,
        tabBarActiveTintColor: theme.colors.primary,
        tabBarInactiveTintColor: theme.colors.divider,
        tabBarStyle: {
          backgroundColor: theme.colors.backgroundMenu,
          borderTopColor: theme.colors.divider,
        },
        header: BottomTabHeader,
      }}
    >
      <Tabs.Screen name="Home" component={ExploreScreen} options={{tabBarIcon: renderHomeIcon, headerShown: false}} />
      <Tabs.Screen name="Search" component={TempSearchScreen} options={{tabBarIcon: renderSearchIcon}} />
      <Tabs.Screen name="Notifications" component={TempNotifScreen} options={{tabBarIcon: renderNotifIcon}} />
      <Tabs.Screen name="Profile" component={TempProfileScreen} options={{tabBarIcon: renderProfileIcon, title: ''}} />
    </Tabs.Navigator>
  )
}

function TempSearchScreen({}: MainNavScreenProps<'Search'>) {
  return (
    <View style={styles.centered}>
      <Text>This should be search screen</Text>
    </View>
  )
}

function TempNotifScreen({}: MainNavScreenProps<'Notifications'>) {
  return (
    <View style={styles.centered}>
      <Text>This should be notifications screen</Text>
    </View>
  )
}

function TempProfileScreen({}: MainNavScreenProps<'Profile'>) {
  return (
    <View style={styles.centered}>
      <Text>This should be profile screen</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
})


type TabBarIconProps = {
  focused: boolean
  color: string
  size: number
}

const renderHomeIcon = ({ color, size }: TabBarIconProps) => (
  <Icon name="home-outline" type="ionicon" {...{color, size}} />
)

const renderSearchIcon = ({ color, size }: TabBarIconProps) => (
  <Icon name="search-outline" type="ionicon" {...{color, size}} />
)

const renderNotifIcon = ({ color, size }: TabBarIconProps) => (
  <Icon name="notifications-outline" type="ionicon" {...{color, size}} />
)

function renderProfileIcon({ color, size }: TabBarIconProps) {
  // TODO: render personal profile icon when signed in
  return <Icon name="person-circle-outline" type="ionicon" {...{color, size}} />
}
