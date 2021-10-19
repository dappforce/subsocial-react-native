//////////////////////////////////////////////////////////////////////
// All the details of a space
import React from 'react'
import { SectionList, SectionListProps, StyleSheet } from 'react-native'
import { AnyPostId, PostData } from '@subsocial/types'
import { Preview } from './Preview'
import * as Post from '../Post'
import { resolveSpaceId, UnifiedSpaceId } from './util'
import { Divider } from '~src/components/Typography'
import { useSubsocialEffect, useSubsocial } from '~src/components/SubsocialContext'
import { DynamicExpansionList, DynamicExpansionListProps } from '../Misc/InfiniteScroll'

export type PostsProps = {
  id: UnifiedSpaceId
}
export function Posts({id: spaceid}: PostsProps) {
  type ListSpec = DynamicExpansionListProps<AnyPostId, PostData>
  
  const {api} = useSubsocial();
  const [, posts] = usePostList(spaceid);
  
  const expander: ListSpec['expander'] = async (ids) => {
    if (!api) throw new Error("Subsocial API somehow uninitialized");
    
    console.log(`expanding post IDs ${ids}...`)
    const data = await api.findAllPosts(ids);
    if (data)
      console.log(`post IDs ${ids} successfully expanded`)
    else
      console.log(`failed to expand post IDs ${ids}`)
    return data.map(post => ({id: post.struct.id, data: post}));
  }
  
  const renderSpace: ListSpec['renderHeader'] = () => {
    return <>
      <Preview id={spaceid} showTags showSocials showAbout showFollowButton containerStyle={styles.padded} />
      <Divider />
    </>
  }
  
  const renderItem: ListSpec['renderItem'] = (data) => {
    return <>
      <Post.Preview.Data id={data.struct.id} state='READY' data={data} />
      <Divider />
    </>
  }
  
  return (
    <DynamicExpansionList
      ids={posts || []}
      expander={expander}
      renderHeader={renderSpace}
      renderItem={renderItem}
    />
  )
}

const usePostList = (spaceid: UnifiedSpaceId) => useSubsocialEffect(async api => {
  if (!spaceid) return;
  const sid = await resolveSpaceId(api.substrate, spaceid);
  return await api.substrate.postIdsBySpaceId(sid);
}, [spaceid]);

const styles = StyleSheet.create({
  padded: {
    padding: 10,
  },
});
