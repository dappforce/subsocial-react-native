//////////////////////////////////////////////////////////////////////
// Stack navigator lying atop the entire app for global navigation,
// e.g. explore spaces, view post, view account.
import React, { useEffect, useMemo } from 'react'
import { createStackNavigator, StackNavigationProp, StackScreenProps } from '@react-navigation/stack'
import { AccountId, PostId, SpaceId } from 'src/types/subsocial'
import { StackHeader } from '~stories/Misc/NavHeader'
import * as Account from '~stories/Account'
import * as Space from '~stories/Space'
import * as Post from '~stories/Post'

export type ExploreRoutes = {
  Explore: { }
  Account: { accountId: AccountId }
  Space: { spaceId: SpaceId }
  Post: { postId: PostId }
}

export type ExploreStackNavigationProp = StackNavigationProp<ExploreRoutes>

export type ExploreStackNavProps = {
  children: React.FC<ExploreStackScreenProps<'Explore'>>
}

export type ExploreStackScreenProps<S extends keyof ExploreRoutes> = StackScreenProps<ExploreRoutes, S>

const Stack = createStackNavigator<ExploreRoutes>()

export function ExploreStackNav({children}: ExploreStackNavProps) {
  return (
    <Stack.Navigator screenOptions={{header: StackHeader}}>
      <Stack.Screen name="Explore" component={children} options={{title: 'Dotsama News (βeta)'}} />
      <Stack.Screen name="Account" component={AccountScreen} options={{title: 'Profile'}} />
      <Stack.Screen name="Space"   component={SpaceScreen} />
      <Stack.Screen name="Post"    component={PostScreen} />
      {/* TODO: Post Comments Screen */}
    </Stack.Navigator>
  )
}

type AccountScreenProps = ExploreStackScreenProps<'Account'>
function AccountScreen({ route }: AccountScreenProps) {
  return <Account.Details id={route.params.accountId} />
}

type SpaceScreenProps = ExploreStackScreenProps<'Space'>
function SpaceScreen({ route }: SpaceScreenProps) {
  return <Space.Posts id={route.params.spaceId} />
}

type PostScreenProps = ExploreStackScreenProps<'Post'>
function PostScreen({ route }: PostScreenProps) {
  return <Post.Details id={route.params.postId} />
}
