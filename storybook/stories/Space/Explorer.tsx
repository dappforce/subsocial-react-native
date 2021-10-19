//////////////////////////////////////////////////////////////////////
// Space Explorer - a whole bunch of summaries
import React from 'react'
import { StyleSheet } from 'react-native'
import { loadSpaces, UnifiedSpaceId } from './util'
import { Preview } from './Preview'
import { Divider } from '~src/components/Typography'
import { DynamicExpansionList } from '~stories/Misc/InfiniteScroll'
import { useSubsocial } from '~src/components/SubsocialContext'
import { SpaceData } from '@subsocial/types'

export type SuggestedType = {
  spaces: UnifiedSpaceId[]
}
export function Suggested({spaces}: SuggestedType) {
  const {api} = useSubsocial();
  const renderItem = (data: SpaceData) => {
    return <>
      <Preview.Data data={data} showAbout showFollowButton showTags preview containerStyle={styles.padded} />
      <Divider />
    </>
  }
  
  async function expander(ids: UnifiedSpaceId[]) {
    if (!api) throw new Error("No Subsocial Context");
    const data = await loadSpaces(api, ids);
    return data.map(s => ({id: s.struct.id, data: s}));
  }
  
  return (
    <DynamicExpansionList
      ids={spaces}
      {...{expander, renderItem}}
    />
  )
}

const styles = StyleSheet.create({
  padded: {
    padding: 10,
    paddingTop: 0,
  },
});
