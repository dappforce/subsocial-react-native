//////////////////////////////////////////////////////////////////////
// Space Explorer - a whole bunch of summaries
import React, { useEffect, useState } from 'react'
import { Dimensions, FlatList, ListRenderItemInfo, StyleSheet, View } from 'react-native'
import { ActivityIndicator } from 'react-native-paper'
import { SubsocialApi } from '@subsocial/api'
import { SpaceData } from '@subsocial/types'
import { useSubsocialInitializer } from '~src/components/SubsocialContext'
import { UnifiedSpaceId } from './util'
import Summary from './Summary'
import { BN } from '@polkadot/util'

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

export type InfiniteExplorerType = {
  
}
export function InfiniteExplorer({}: InfiniteExplorerType) {
  const wh = Dimensions.get('window').height;
  const [data, setData] = useState([] as SpaceData[]);
  const [lastSpaceId, setLastSpaceId] = useState(new BN(-1));
  
  useSubsocialInitializer(async (api) => {
    // nextSpaceId is like the LAST enum - it helps us find all other space IDs
    const nextSpaceId = (await api.substrate.nextSpaceId()).toBn();
    setData(data.concat(await loadNext({api, lastSpaceId: nextSpaceId.subn(1), count: 10})));
  }, []);
  
  const onEndReached = () => {
    
  }
  
  const renderItem = ({item: data}: ListRenderItemInfo<SpaceData>) => {
    return <Summary.Data data={data} key={data.struct.id.toString()} preview showTags />
  }
  
  const keyExtractor = (item: SpaceData) => item.struct.id.toString();
  
  if (!data.length) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator />
      </View>
    )
  }
  else {
    return <FlatList
      data={data}
      onEndReachedThreshold={2}
      {...{renderItem, keyExtractor, onEndReached}}
    />
  }
}

type LoadNextProps = {
  api: SubsocialApi
  lastSpaceId: BN
  count: number
}
async function loadNext({api, lastSpaceId, count}: LoadNextProps): Promise<SpaceData[]> {
  let result: SpaceData[] = [];
  while (lastSpaceId.gt(new BN(0)) && result.length < count) {
    const fetchIds: BN[] = [];
    for (let i = 0; i < count-result.length; ++i) {
      fetchIds.push(lastSpaceId.clone());
      lastSpaceId = lastSpaceId.subn(1);
    }
    
    const tmpData = await api.findAllSpaces(fetchIds);
    result = result.concat(tmpData);
    console.log(tmpData);
  }
  return result;
}

const styles = StyleSheet.create({
  loading: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
});
