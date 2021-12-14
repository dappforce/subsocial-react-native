//////////////////////////////////////////////////////////////////////
// Screen with top tabs for Latest Posts & Dotsama Spaces
import React, { useCallback, useState } from 'react'
import { createMaterialTopTabNavigator, MaterialTopTabNavigationProp, MaterialTopTabScreenProps } from '@react-navigation/material-top-tabs'
import { useSubsocial } from '~comps/SubsocialContext'
import { PostId } from 'src/types/subsocial'
import { useAppDispatch } from 'src/rtk/app/hooksCommon'
import { RefreshPayload, fetchSpacePosts } from 'src/rtk/features/spacePosts/spacePostsSlice'
import { fetchPosts } from 'src/rtk/features/posts/postsSlice'
import { useTheme } from '~comps/Theming'
import { ExploreStackNav } from '~comps/ExploreStackNav'
import * as Space from '../Space'
import * as Post from '../Post'
import { InfiniteScrollList, InfiniteScrollListProps } from '~stories/Misc'
import { descending } from 'src/util/algo'
import { asString } from '@subsocial/utils'
import config from 'config.json'

export type ExploreNavRoutes = {
  LatestPosts: {}
  DotsamaSpaces: {}
}

export type ExploreNavProps = MaterialTopTabNavigationProp<ExploreNavRoutes>
export type ExploreNavScreenProps<S extends keyof ExploreNavRoutes> = MaterialTopTabScreenProps<ExploreNavRoutes, S>

const Tabs = createMaterialTopTabNavigator<ExploreNavRoutes>()

export type ExploreScreenProps = {}
export function ExploreScreen({}: ExploreScreenProps) {
  const theme = useTheme()
  
  return (
    <ExploreStackNav>
      {useCallback(() => (
        <Tabs.Navigator
          initialRouteName="LatestPosts"
          screenOptions={{
            tabBarActiveTintColor: theme.colors.primary,
            tabBarInactiveTintColor: theme.colors.textDisabled,
            tabBarIndicatorStyle: {
              backgroundColor: theme.colors.primary,
            },
            tabBarLabelStyle: {
              ...theme.fonts.secondary,
              textTransform: 'none',
            },
            tabBarItemStyle: {
              padding: 0,
              minHeight: 40,
            },
            tabBarStyle: {
              height: 40,
            },
            lazy: true,
          }}
        >
          <Tabs.Screen name="LatestPosts"   component={LatestPostsScreen}   options={{title: 'Latest Posts'}} />
          <Tabs.Screen name="DotsamaSpaces" component={DotsamaSpacesScreen} options={{title: 'Dotsama Spaces'}} />
        </Tabs.Navigator>
      ), [ theme ])}
    </ExploreStackNav>
  )
}

type DotsamaSpacesScreenProps = ExploreNavScreenProps<'DotsamaSpaces'>
function DotsamaSpacesScreen({}: DotsamaSpacesScreenProps) {
  return <Space.Suggested spaces={config.suggestedSpaces.map(asString)} />
}

type ListPropsSpec = InfiniteScrollListProps<PostId>

type LatestPostsScreenProps = ExploreNavScreenProps<'LatestPosts'>
function LatestPostsScreen({}: LatestPostsScreenProps) {
  const spaceIds = config.suggestedSpaces
  const { api } = useSubsocial()
  const dispatch = useAppDispatch()
  const [ ids, setIds ] = useState<PostId[]>([])
  
  const loadInitial = useCallback<ListPropsSpec['loadInitial']>(async (pageSize) => {
    const thunkResults = await Promise.all(spaceIds.map( id => dispatch(fetchSpacePosts({ api, id })) ))
    let result = [] as PostId[]
    
    for (let thunkResult of thunkResults) {
      result.splice(result.length, 0, ...(thunkResult.payload as RefreshPayload).posts)
    }
    result.sort(descending)
    
    setIds(result)
    return [result.slice(0, pageSize), 1]
  }, [ api, dispatch, spaceIds ])
  
  const loadMore = useCallback<ListPropsSpec['loadMore']>(async (page, pageSize) => {
    if (page > Math.floor(ids.length / pageSize)) return false
    
    return ids.slice(page * pageSize, (page + 1) * pageSize)
  }, [ ids ])
  
  const loadItems = useCallback<ListPropsSpec['loadItems']>(async (ids) => {
    await dispatch(fetchPosts({ api, ids }))
  }, [ api, dispatch ])
  
  return (
    <InfiniteScrollList
      loadInitial={loadInitial}
      loadMore={loadMore}
      loadItems={loadItems}
      renderItem={renderWrappedPost}
    />
  )
}

type WrappedPostProps = {
  id: PostId
}
const WrappedPost = React.memo(({ id }: WrappedPostProps) => {
  const theme = useTheme()
  
  return (
    <Post.Preview
      id={id}
      containerStyle={{ borderBottomColor: theme.colors.divider }}
    />
  )
})
const renderWrappedPost = (id: PostId) => <WrappedPost id={id} />
