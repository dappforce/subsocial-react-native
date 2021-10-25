//////////////////////////////////////////////////////////////////////
// Latest posts preloaded from suggested spaces
import React, { useCallback } from 'react'
import { useCreateReloadPosts } from 'src/rtk/app/hooks'
import { useSubsocial, useSubsocialEffect } from '~comps/SubsocialContext'
import { PostId } from 'src/types/subsocial'
import { RefreshPayload, refreshSpacePosts } from 'src/rtk/features/spacePosts/spacePostsSlice'
import { DynamicExpansionList, DynamicExpansionListProps } from '~stories/Misc'
import { useAppDispatch } from 'src/rtk/app/store'
import { Divider } from '~comps/Typography'
import * as Post from '../Post'
import { descending } from 'src/util'
import config from 'config.json'

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
      <Post.Preview id={id} />
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
