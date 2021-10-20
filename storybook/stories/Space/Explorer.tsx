//////////////////////////////////////////////////////////////////////
// Space Explorer - a whole bunch of summaries
import React, { useCallback, useEffect, useState } from 'react'
import { StyleSheet } from 'react-native'
import { Preview } from './Preview'
import { Divider } from 'src/components/Typography'
import { DynamicExpansionList } from '~stories/Misc/InfiniteScroll'
import { SpaceId } from 'src/types/subsocial'
import { useCreateReloadPosts } from 'src/rtk/app/hooks'

export type SuggestedType = {
  spaces: SpaceId[]
}
export function Suggested({spaces}: SuggestedType) {
  const [postponeIds, setPostponeIds] = useState<SpaceId[]>([])
  const reloadPosts = useCreateReloadPosts()
  const renderItem = (id: SpaceId) => {
    console.log(id)
    return <>
      <Preview id={id} showAbout showFollowButton showTags preview containerStyle={styles.padded} />
      <Divider />
    </>
  }
  
  const loader = useCallback(async (ids: SpaceId[]) => {
    if (reloadPosts) {
      reloadPosts({ids})
    }
    else {
      setPostponeIds(postponeIds.concat(ids))
    }
    return ids.map(id => ({id, data: id}))
  }, [reloadPosts])
  
  useEffect(() => {
    if (reloadPosts && postponeIds.length) {
      reloadPosts({ids: postponeIds})
    }
  }, [reloadPosts])
  
  return (
    <DynamicExpansionList
      ids={spaces}
      {...{loader, renderItem}}
    />
  )
}

const styles = StyleSheet.create({
  padded: {
    padding: 10,
    paddingTop: 0,
  },
});
