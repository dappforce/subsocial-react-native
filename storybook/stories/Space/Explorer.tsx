//////////////////////////////////////////////////////////////////////
// Space Explorer - a whole bunch of summaries
import React, { useEffect, useState } from 'react'
import { FlatList, ListRenderItemInfo, StyleSheet, View } from 'react-native'
import { SpaceId } from './util'
import Summary from './Summary'

export type PreviewExplorerType = {
  spaces: SpaceId[]
}
export function PreviewExplorer({spaces}: PreviewExplorerType) {
  const renderItem = ({item: id}: ListRenderItemInfo<SpaceId>) => {
    return <Summary id={id} showTags preview />
  }
  return (
    <FlatList data={spaces} renderItem={renderItem} />
  )
}
