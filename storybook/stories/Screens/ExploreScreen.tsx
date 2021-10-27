//////////////////////////////////////////////////////////////////////
// Screen with top tabs for Latest Posts & Dotsama Spaces
import React, { useCallback } from 'react'
import { createMaterialTopTabNavigator, MaterialTopTabNavigationOptions, MaterialTopTabNavigationProp, MaterialTopTabScreenProps } from '@react-navigation/material-top-tabs'
import { useSubsocial, useSubsocialEffect } from '~comps/SubsocialContext'
import { PostId } from 'src/types/subsocial'
import { useAppDispatch } from 'src/rtk/app/hooksCommon'
import { useCreateReloadPosts } from 'src/rtk/app/hooks'
import { RefreshPayload, refreshSpacePosts } from 'src/rtk/features/spacePosts/spacePostsSlice'
import { useTheme } from '~comps/Theming'
import * as Space from '../Space'
import * as Post from '../Post'
import { DynamicExpansionList, DynamicExpansionListProps } from '~stories/Misc'
import { Divider } from '~comps/Typography'
import { asString } from '@subsocial/utils'
import { descending } from 'src/util'
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
        tabBarStyle: {
          height: 40,
        },
        swipeEnabled: false,
        lazy: true,
      }}
    >
      <Tabs.Screen name="LatestPosts"   component={LatestPostsScreen}   options={{title: 'Latest Posts'}} />
      <Tabs.Screen name="DotsamaSpaces" component={DotsamaSpacesScreen} options={{title: 'Dotsama Spaces'}} />
    </Tabs.Navigator>
  )
}

type DotsamaSpacesScreenProps = ExploreNavScreenProps<'DotsamaSpaces'>
function DotsamaSpacesScreen({}: DotsamaSpacesScreenProps) {
  return <Space.Suggested spaces={config.suggestedSpaces.map(asString)} />
}

type LatestPostsScreenProps = ExploreNavScreenProps<'LatestPosts'>
function LatestPostsScreen({}: LatestPostsScreenProps) {
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
  
  const loader: ListProps['loader'] = async (ids) => {
    await reloadPosts?.({ids})
  }
  
  const renderItem: ListProps['renderItem'] = (id) => <WrappedPost id={id} />
  
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

type WrappedPostProps = {
  id: PostId
}
const WrappedPost = React.memo(({id}: WrappedPostProps) => {
  return <>
    <Post.Preview id={id} />
    <Divider />
  </>
})
