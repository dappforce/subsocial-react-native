//////////////////////////////////////////////////////////////////////
// Main Screen consisting of Bottom Tabs navigation
import React from 'react'
import { Pressable, StyleProp, StyleSheet, View, ViewStyle } from 'react-native'
import { BottomTabNavigationProp, BottomTabScreenProps, createBottomTabNavigator, BottomTabBar, BottomTabBarProps } from '@react-navigation/bottom-tabs'
import { createThemedStylesHook, useTheme } from '~comps/Theming'
import { useLoadKeypair, useSelectReplyTo } from 'src/rtk/app/hooks'
import { BottomTabHeader } from '~stories/Misc/NavHeader'
import { ExploreScreen } from './ExploreScreen'
import { Text } from '~comps/Typography'
import { Icon } from '~comps/Icon'
import { MyIpfsAvatar } from '~comps/IpfsImage'
import { MyAccountDetails } from '~stories/Account'
import { ReplyInput } from '~stories/Comments'
import Elevations from 'react-native-elevation'

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
  const styles = useThemedStyles()
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

const MainScreenTabBar = React.memo(({ state, navigation, descriptors }: BottomTabBarProps) => {
  const { colors } = useTheme()
  const styles = useThemedStyles()
  const replyTo = useSelectReplyTo()
  
  return (
    <View style={styles.container}>
      {!!replyTo && <ReplyInput postId={replyTo.postId} containerStyle={styles.replyTo} autoFocus={replyTo.autoFocus} />}
      <View style={styles.tabBar}>
        {state.routes.map((route, index) => {
          const { options: opts } = descriptors[route.key]
          const isFocused = state.index === index
          const renderIcon = opts.tabBarIcon ?? (() => null)
          const inactiveTint = opts.tabBarInactiveTintColor ?? colors.line
          const activeTint   = opts.tabBarActiveTintColor ?? colors.primary
          
          const onPress = () => {
            const event = navigation.emit({
              type: 'tabPress',
              target: route.key,
              canPreventDefault: true,
            });
            
            if (!isFocused && !event.defaultPrevented) {
              navigation.navigate(route.name, route.params)
            }
          }
          
          const onLongPress = () => {
            navigation.emit({
              type: 'tabLongPress',
              target: route.key,
            })
          }
          
          return (
            <Pressable
              accessibilityRole="button"
              accessibilityState={isFocused ? { selected: true } : {}}
              accessibilityLabel={opts.tabBarAccessibilityLabel ?? opts.title ?? route.name}
              testID={opts.tabBarTestID}
              onPress={onPress}
              onLongPress={onLongPress}
              style={opts.tabBarItemStyle}
            >
              {renderIcon({
                focused: isFocused,
                color: isFocused ? activeTint : inactiveTint,
                size: 24,
              })}
            </Pressable>
          )
        })}
      </View>
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
  container: {
    backgroundColor: colors.backgroundMenu,
    borderTopColor: colors.line,
    borderTopWidth: 1,
  },
  tabBar: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingTop: 13,
    paddingBottom: 13,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  replyTo: {
    paddingTop: 10,
    paddingBottom: 5,
    paddingHorizontal: 20,
  },
}))


type TabBarIconProps = {
  focused: boolean
  color: string
  size: number
}

const renderHomeIcon = ({ color, size }: TabBarIconProps) => {
  return <Icon icon={{family: 'ionicon', name: 'home-outline'}} color={color} size={size} />
}

const renderSearchIcon = ({ color, size }: TabBarIconProps) => {
  return <Icon icon={{family: 'ionicon', name: 'search-outline'}} color={color} size={size} />
}

const renderNotifIcon = ({ color, size }: TabBarIconProps) => {
  return <Icon icon={{family: 'ionicon', name: 'notifications-outline'}} color={color} size={size} />
}
