//////////////////////////////////////////////////////////////////////
// Space Explorer - a whole bunch of summaries
import React, { useCallback, useEffect, useState } from 'react'
import { StyleSheet } from 'react-native'
import { Preview } from './Preview'
import { Divider } from 'src/components/Typography'
import { DynamicExpansionList } from '~stories/Misc/InfiniteScroll'
import { SpaceId } from 'src/types/subsocial'
import { useCreateReloadSpace } from 'src/rtk/app/hooks'

export type SuggestedType = {
  spaces: SpaceId[]
}
export function Suggested({spaces}: SuggestedType) {
  const reloadSpace = useCreateReloadSpace()
  const renderItem = (id: SpaceId) => {
    return <>
      <Preview id={id} showAbout showFollowButton showTags preview containerStyle={styles.padded} />
      <Divider />
    </>
  }
  
  const loader = async (ids: SpaceId[]) => {
    ids.forEach(id => {
      reloadSpace?.({id})
    })
  }
  
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
  },
});
