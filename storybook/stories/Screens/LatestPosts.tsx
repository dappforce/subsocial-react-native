//////////////////////////////////////////////////////////////////////
// Latest posts preloaded from suggested spaces
import React, { useCallback, useMemo } from 'react'
import { StyleSheet } from 'react-native'
import { useNavigation } from '@react-navigation/native'
import { createStackNavigator, StackNavigationProp, StackScreenProps } from '@react-navigation/stack'
import { useAppDispatch } from 'src/rtk/app/store'
import { useCreateReloadPosts, useSelectPost } from 'src/rtk/app/hooks'
import { useSubsocial, useSubsocialEffect } from '~comps/SubsocialContext'
import { AccountId, PostId, SpaceId } from 'src/types/subsocial'
import { RefreshPayload, refreshSpacePosts } from 'src/rtk/features/spacePosts/spacePostsSlice'
import { StackHeader } from '~stories/Misc/NavHeader'
import { DynamicExpansionList, DynamicExpansionListProps } from '~stories/Misc'
import { Divider } from '~comps/Typography'
import * as Account from '../Account'
import * as Post from '../Post'
import * as Space from '../Space'
import { descending } from 'src/util'
import config from 'config.json'

type Routes = {
  LatestPosts: {}
  Account: Account.RouteParams
  Post: PostRouteParams
  Space: SpaceRouteParams
}
type NavProps = StackNavigationProp<Routes>

type PostRouteParams = {
  postId: PostId
}
type SpaceRouteParams = {
  spaceId: SpaceId
}

const Stack = createStackNavigator<Routes>()

export type LatestPostsScreenProps = {}
export function LatestPostsScreen({}: LatestPostsScreenProps) {
  return (
    <Stack.Navigator screenOptions={{header: StackHeader}}>
      <Stack.Screen name="LatestPosts" component={LatestPosts} options={{title: 'Explore'}} />
      <Stack.Screen name="Account" component={Account.Screen} />
      <Stack.Screen name="Post" component={PostScreen} />
      <Stack.Screen name="Space" component={SpaceScreen} options={{title: 'Explore'}} />
    </Stack.Navigator>
  )
}

export type LatestPostsProps = {
  
}
export function LatestPosts({}: LatestPostsProps) {
  type ListProps = DynamicExpansionListProps<PostId>
  
  const spaceIds = config.suggestedSpaces
  const { api } = useSubsocial()
  const dispatch = useAppDispatch()
  const reloadPosts = useCreateReloadPosts()
  
  const loadIds = useCallback(async () => {
    if (!api) return []
    
    const thunkResults = await Promise.all(spaceIds.map( id => dispatch(refreshSpacePosts({ api, id })) ))
    let result = [] as PostId[]
    
    for (let thunkResult of thunkResults) {
      result = result.concat((thunkResult.payload as RefreshPayload).posts)
    }
    result.sort(descending)
    
    return result
  }, [ api, dispatch, spaceIds ])
  
  const loader: ListProps['loader'] = (ids) => {
    reloadPosts?.({ids})
  }
  
  const renderItem: ListProps['renderItem'] = (id) => {
    return <>
      <WrappedPost id={id} />
      <Divider />
    </>
  }
  
  useSubsocialEffect(async api => {
    if (!api || !dispatch) return
    
    // must use dispatch & action directly because number of spaces
    // could theoretically change, violating fixed hooks rule
    await Promise.all(config.suggestedSpaces.map( id => dispatch(refreshSpacePosts({ api, id })) ))
  }, [ dispatch ])
  
  return (
    <DynamicExpansionList ids={loadIds} {...{renderItem, loader}} />
  )
}

function WrappedPost({id, ...props}: Post.PostPreviewProps) {
  const nav = useNavigation<NavProps>()
  const data = useSelectPost(id)
  const ownerId = data?.post?.struct?.ownerId
  const spaceId = data?.post?.struct?.spaceId
  
  const onPressMore = useMemo(() => {
    return () => nav.navigate('Post', {postId: id})
  }, [ id ])
  
  const onPressOwner = useMemo(() => {
    if (!ownerId) return undefined
    return () => nav.navigate('Account', {accountId: ownerId})
  }, [ ownerId, nav ])
  
  const onPressSpace = useMemo(() => {
    if (!spaceId) return undefined
    return () => nav.navigate('Space', {spaceId})
  }, [ spaceId, nav ])
  
  return (
    <Post.Preview id={id}
      {...{onPressMore, onPressOwner, onPressSpace}}
      {...props}
    />
  )
}

type PostScreenProps = StackScreenProps<Routes, 'Post'>
function PostScreen({route}: PostScreenProps) {
  const nav = useNavigation<NavProps>()
  const postId = route.params.postId
  const data = useSelectPost(route.params.postId)
  const ownerId = data?.post?.struct?.ownerId
  const spaceId = data?.post?.struct?.spaceId
  
  const onPressOwner = useMemo(() => {
    if (!ownerId) return undefined
    return () => nav.navigate('Account', { accountId: ownerId })
  }, [ ownerId, nav ])
  
  const onPressSpace = useMemo(() => {
    if (!spaceId) return undefined
    return () => nav.navigate('Space', { spaceId })
  }, [ spaceId, nav ])
  
  return (
    <Post.Details
      id={postId}
      {...{onPressOwner, onPressSpace}}
      containerStyle={styles.padded}
    />
  )
}

type SpaceScreenProps = StackScreenProps<Routes, 'Space'>
function SpaceScreen({route}: SpaceScreenProps) {
  const nav = useNavigation<NavProps>()
  
  const onPressMore  = useCallback((id: PostId) => nav.navigate('Post', {postId: id}), [])
  const onPressOwner = useCallback((id: PostId, ownerId: AccountId) => nav.navigate('Account', {accountId: ownerId}), [])
  
  return (
    <Space.Posts
      id={route.params.spaceId}
      {...{onPressMore, onPressOwner}}
    />
  )
}


const styles = StyleSheet.create({
  padded: {
    padding: 10,
  },
})
