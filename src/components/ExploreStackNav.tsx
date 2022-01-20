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
import { CommentThread } from '~stories/Comments'
import { StyleSheet } from 'react-native'
import { useReplyTo } from 'src/rtk/app/hooks'
import { ScrollView } from 'react-native-gesture-handler'

export type ExploreRoutes = {
  Explore: { }
  Account: { accountId: AccountId }
  Space: { spaceId: SpaceId }
  Post: { postId: PostId, reply?: boolean }
  Comment: { commentId: PostId, reply?: boolean }
}

export type ExploreStackNavigationProp = StackNavigationProp<ExploreRoutes>

export type ExploreStackNavProps = {
  children: React.FC<ExploreStackScreenProps<'Explore'>>
  title?: string
}

export type ExploreStackScreenProps<S extends keyof ExploreRoutes> = StackScreenProps<ExploreRoutes, S>

const Stack = createStackNavigator<ExploreRoutes>()

export function ExploreStackNav({ children, title }: ExploreStackNavProps) {
  return (
    <Stack.Navigator screenOptions={{ header: StackHeader }}>
      <Stack.Screen name="Explore" component={children} options={{title: title ?? 'Dotsama News (βeta)'}} />
      <Stack.Screen name="Account" component={AccountScreen} options={{title: 'Profile'}} />
      <Stack.Screen name="Space"   component={SpaceScreen} />
      <Stack.Screen name="Post"    component={PostScreen} />
      <Stack.Screen name="Comment" component={CommentScreen} />
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
  const {
    postId,
    reply,
  } = route.params
  
  useReplyTo(postId, !!reply)
  return <Post.Details id={postId} />
}

type CommentScreenProps = ExploreStackScreenProps<'Comment'>
function CommentScreen({ route }: CommentScreenProps) {
  const {
    commentId,
    reply,
  } = route.params
  
  useReplyTo(commentId, !!reply)
  return (
    <ScrollView style={styles.padded}>
      <CommentThread id={commentId} active />
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  padded: {
    padding: 20,
  },
})
