//////////////////////////////////////////////////////////////////////
// Space Explorer - a whole bunch of summaries
import React from 'react'
import { FlatList, ListRenderItemInfo, StyleSheet } from 'react-native'
import { UnifiedSpaceId } from './util'
import { Summary } from './Summary'
import { Divider } from '~src/components/Typography'

export type SuggestedType = {
  spaces: UnifiedSpaceId[]
}
export function Suggested({spaces}: SuggestedType) {
  const renderItem = ({item: id}: ListRenderItemInfo<UnifiedSpaceId>) => {
    return <>
      <Summary id={id} showAbout showFollowButton showTags preview containerStyle={styles.padded} />
      <Divider />
    </>
  }
  const keyExtractor = (item: UnifiedSpaceId) => item.toString();
  return (
    <FlatList data={spaces} {...{renderItem, keyExtractor}} />
  )
}

const styles = StyleSheet.create({
  padded: {
    padding: 10,
    paddingTop: 0,
  },
});
