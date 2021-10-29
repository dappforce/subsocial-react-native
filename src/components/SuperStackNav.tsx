//////////////////////////////////////////////////////////////////////
// Stack navigator lying atop the entire app for global navigation,
// e.g. explore spaces, view post, view account.
import React from 'react'
import { createStackNavigator, StackNavigationProp, StackScreenProps } from '@react-navigation/stack'
import { AccountId, PostId, SpaceId } from 'src/types/subsocial'
import { StackHeader } from '~stories/Misc/NavHeader'
import * as Account from '~stories/Account'
import * as Space from '~stories/Space'
import * as Post from '~stories/Post'

export type SuperRoutes = {
  Explore: { }
  Account: { accountId: AccountId }
  Space: { spaceId: SpaceId }
  Post: { postId: PostId }
}

export type SuperStackNavigationProp = StackNavigationProp<SuperRoutes>

export type SuperStackNavProps = {
  ExploreComponent: React.ComponentType<SuperStackScreenProps<'Explore'>>
}

export type SuperStackScreenProps<S extends keyof SuperRoutes> = StackScreenProps<SuperRoutes, S>

const Stack = createStackNavigator<SuperRoutes>()

export function SuperStackNav({ExploreComponent}: SuperStackNavProps) {
  return (
    <Stack.Navigator screenOptions={{header: StackHeader}}>
      <Stack.Screen name="Explore" component={ExploreComponent} options={{headerShown: false}} />
      <Stack.Screen name="Account" component={AccountScreen} options={{title: 'Profile'}} />
      <Stack.Screen name="Space"   component={SpaceScreen} />
      <Stack.Screen name="Post"    component={PostScreen} />
      {/* TODO: Post Comments Screen */}
    </Stack.Navigator>
  )
}

type AccountScreenProps = SuperStackScreenProps<'Account'>
function AccountScreen({ route }: AccountScreenProps) {
  // TODO: Actual Account Screen
  return null
}

type SpaceScreenProps = SuperStackScreenProps<'Space'>
function SpaceScreen({ route }: SpaceScreenProps) {
  return <Space.Posts id={route.params.spaceId} />
}

type PostScreenProps = SuperStackScreenProps<'Post'>
function PostScreen({ route }: PostScreenProps) {
  return <Post.Details id={route.params.postId} />
}
