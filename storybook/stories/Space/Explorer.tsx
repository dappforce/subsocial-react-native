//////////////////////////////////////////////////////////////////////
// Space Explorer - a whole bunch of summaries
import React from 'react'
import { FlatList, ListRenderItemInfo } from 'react-native'
import { UnifiedSpaceId } from './util'
import { Summary } from './Summary'

export type PreviewExplorerType = {
  spaces: UnifiedSpaceId[]
}
export function PreviewExplorer({spaces}: PreviewExplorerType) {
  const renderItem = ({item: id}: ListRenderItemInfo<UnifiedSpaceId>) => {
    return <Summary id={id} preview />
  }
  const keyExtractor = (item: UnifiedSpaceId) => item.toString();
  return (
    <FlatList data={spaces} {...{renderItem, keyExtractor}} />
  )
}
