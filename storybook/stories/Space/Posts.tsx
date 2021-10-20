//////////////////////////////////////////////////////////////////////
// All the details of a space
import React from 'react'
import { StyleSheet } from 'react-native'
import { Preview } from './Preview'
import * as Post from '../Post'
import { resolveSpaceId } from './util'
import { Divider } from 'src/components/Typography'
import { useSubsocialEffect } from 'src/components/SubsocialContext'
import { DynamicExpansionList, DynamicExpansionListProps } from '../Misc/InfiniteScroll'
import { PostId, SpaceId } from 'src/types/subsocial'
import BN from 'bn.js'
import { useCreateReloadPosts } from 'src/rtk/app/hooks'

export type PostsProps = {
  id: SpaceId
}
export function Posts({id: spaceid}: PostsProps) {
  type ListSpec = DynamicExpansionListProps<PostId>
  
  const reloadPosts = useCreateReloadPosts()
  const [, posts] = usePostList(spaceid)
  
  const loader: ListSpec['loader'] = async (ids) => {
    console.log(reloadPosts, ids)
    reloadPosts?.({ids})
  }
  
  const renderSpace: ListSpec['renderHeader'] = () => {
    return <>
      <Preview id={spaceid} showTags showSocials showAbout showFollowButton containerStyle={styles.padded} />
      <Divider />
    </>
  }
  
  const renderItem: ListSpec['renderItem'] = (id) => {
    return <>
      <Post.Preview id={id} />
      <Divider />
    </>
  }
  
  return (
    <DynamicExpansionList
      ids={posts || []}
      loader={loader}
      renderHeader={renderSpace}
      renderItem={renderItem}
    />
  )
}

const usePostList = (spaceid: SpaceId) => useSubsocialEffect(async api => {
  if (!spaceid) return;
  const sid = await resolveSpaceId(api.substrate, spaceid);
  const bnids = await api.substrate.postIdsBySpaceId(new BN(sid));
  return bnids.map(bn => bn+'')
}, [spaceid]);

const styles = StyleSheet.create({
  padded: {
    padding: 10,
  },
});
