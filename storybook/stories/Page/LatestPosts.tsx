//////////////////////////////////////////////////////////////////////
// Latest posts preloaded from suggested spaces
import React, { useState } from 'react'
import { useCreateReloadPosts, useSelectSpacesPosts } from 'src/rtk/app/hooks'
import { useSubsocialEffect } from '~comps/SubsocialContext'
import { PostId } from 'src/types/subsocial'
import { DynamicExpansionList, DynamicExpansionListProps } from '~stories/Misc'
import { useAppDispatch } from 'src/rtk/app/store'
import { refreshSpacePosts } from 'src/rtk/features/spacePosts/spacePostsSlice'
import * as Post from '../Post'
import { asString } from '@subsocial/utils'
import config from 'config.json'

export type LatestPostsProps = {
  
}
export function LatestPosts({}: LatestPostsProps) {
  type ListProps = DynamicExpansionListProps<PostId>
  
  const dispatch = useAppDispatch()
  const postIds = useSelectSpacesPosts(config.suggestedSpaces.map(asString))
  const reloadPosts = useCreateReloadPosts()
  
  const renderItem: ListProps['renderItem'] = (id) => <Post.Preview id={id} />
  const loader: ListProps['loader'] = (ids) => {
    reloadPosts?.({ids})
  }
  
  useSubsocialEffect(async api => {
    if (!api || !dispatch) return
    
    // must use dispatch & action directly because number of spaces
    // could theoretically change, violating fixed hooks rule
    await Promise.all(config.suggestedSpaces.map( id => dispatch(refreshSpacePosts({ api, id })) ))
  }, [ dispatch ])
  
  return (
    <DynamicExpansionList ids={postIds} {...{renderItem, loader}} />
  )
}
