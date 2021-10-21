//////////////////////////////////////////////////////////////////////
// Custom list implementations to help with arbitrary InfiniteScroll
import React, { ReactElement, useEffect, useReducer, useState } from 'react'
import { SectionList, SectionListData, SectionListProps } from 'react-native'

export interface DynamicDataLoader<ID> {
  (ids: ID[]): void
}

type ExpansionStage = 'INITIAL' | 'BUSY' | 'READY'
type ExpansionState = {
  stage: ExpansionStage
  lastIdx: number
}

type ExpansionAction = {
  type: 'INIT' | 'BEGIN_EXPAND'
} | {
  type: 'FINISH_EXPAND'
  lastIdx: number
}

export type DynamicExpansionListProps<ID> = {
  ids: ID[]
  loader: DynamicDataLoader<ID>
  renderItem: (id: ID) => ReactElement
  renderHeader?: () => ReactElement
  batchSize?: number
  onRefresh?: () => void
}
export function DynamicExpansionList<ID>({
  ids: _ids,
  loader,
  renderItem: _renderItem,
  renderHeader,
  batchSize = 10,
}: DynamicExpansionListProps<ID>)
{
  type SectionListSpec = SectionListProps<ID>
  
  function reducer(state: ExpansionState, action: ExpansionAction): ExpansionState {
    switch (action.type) {
      case 'INIT': {
        return {
          stage: 'READY',
          lastIdx: 0,
        };
      }
      case 'BEGIN_EXPAND': {
        return {
          ...state,
          stage: 'BUSY',
        }
      }
      case 'FINISH_EXPAND': {
        return {
          stage: 'READY',
          lastIdx: action.lastIdx,
        };
      }
    }
  }
  
  const INIT_STATE: ExpansionState = {stage: 'INITIAL', lastIdx: 0}
  const [ids, setIds] = useState<ID[]>([])
  const [{stage, lastIdx}, dispatch] = useReducer(reducer, INIT_STATE)
  const sections: SectionListData<ID>[] = [{data: stage !== 'INITIAL' ? ids.slice(lastIdx) : []}]
  const [initializedList, setInitializedList] = useState(false)
  
  async function loadMore() {
    if (lastIdx === 0) return;
    if (stage !== 'READY') return;
    
    const newLastIdx = Math.max(lastIdx+batchSize, 0);
    const sublist = ids.slice(lastIdx, newLastIdx);
    console.log(lastIdx, newLastIdx)
    
    dispatch({type: 'BEGIN_EXPAND'})
    await loader(sublist)
    dispatch({type: 'FINISH_EXPAND', lastIdx: newLastIdx})
  }
  
  useEffect(() => {
    const idsetNew = new Set(_ids)
    const idsetOld = new Set( ids)
    if (ids.find(id => !idsetNew.has(id)) || _ids.find(id => !idsetOld.has(id))) {
      dispatch({type: 'INIT'})
      setIds([...idsetNew].sort((a, b) => Number(b) - Number(a)))
      setInitializedList(false)
    }
  }, [_ids])
  useEffect(() => {
    if (stage === 'READY' && !initializedList) {
      setInitializedList(true)
      loadMore()
    }
  }, [initializedList, stage])
  
  const renderSectionHeader: SectionListSpec['renderSectionHeader'] = ({}) => renderHeader?.() || null
  const renderItem: SectionListSpec['renderItem'] = ({item: id}) => _renderItem(id);
  
  return (
    <SectionList
      {...{sections, renderItem, renderSectionHeader}}
      onEndReached={loadMore}
      onEndReachedThreshold={2}
      keyExtractor={(id) => id+''}
    />
  )
}
