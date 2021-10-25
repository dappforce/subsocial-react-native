//////////////////////////////////////////////////////////////////////
// All the details of a space
import React, { useEffect } from 'react'
import { StyleSheet } from 'react-native'
import { PostId, SpaceId } from 'src/types/subsocial'
import { useCreateReloadPosts, useRefreshSpacePosts, useResolvedSpaceHandle, useSelectSpacePosts } from 'src/rtk/app/hooks'
import { DynamicExpansionList, DynamicExpansionListProps } from '../Misc/InfiniteScroll'
import { Preview } from './Preview'
import * as Post from '../Post'
import { Divider } from 'src/components/Typography'

export type PostsProps = {
  id: SpaceId
}
export function Posts({id: spaceid}: PostsProps) {
  type ListSpec = DynamicExpansionListProps<PostId>
  
  const resolvedId = useResolvedSpaceHandle(spaceid)
  const posts = useSelectSpacePosts(resolvedId) ?? []
  const reloadPosts = useCreateReloadPosts()
  const refreshPosts = useRefreshSpacePosts()
  
  const loader: ListSpec['loader'] = async (ids) => {
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
  
  useEffect(() => {
    refreshPosts?.({id: resolvedId})
  }, [resolvedId])
  
  return (
    <DynamicExpansionList
      ids={posts}
      loader={loader}
      renderHeader={renderSpace}
      renderItem={renderItem}
    />
  )
}

const styles = StyleSheet.create({
  padded: {
    padding: 10,
  },
});
