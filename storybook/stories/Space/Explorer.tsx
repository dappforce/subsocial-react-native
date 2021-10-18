//////////////////////////////////////////////////////////////////////
// Space Explorer - a whole bunch of summaries
import React from 'react'
import { FlatList, ListRenderItemInfo, StyleSheet } from 'react-native'
import { resolveSpaceId, UnifiedSpaceId } from './util'
import { Summary } from './Summary'
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
      <Summary.Data data={data} showAbout showFollowButton showTags preview containerStyle={styles.padded} />
      <Divider />
    </>
  }
  
  async function expander(ids: UnifiedSpaceId[]) {
    if (!api) throw new Error("No Subsocial Context");
    const resolved = await Promise.all(ids.map(id => resolveSpaceId(api.substrate, id)));
    const data = await api.findAllSpaces(resolved);
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
