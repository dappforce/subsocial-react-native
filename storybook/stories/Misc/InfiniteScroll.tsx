//////////////////////////////////////////////////////////////////////
// Custom list implementations to help with arbitrary InfiniteScroll
import React, { ReactElement, useEffect, useReducer, useState } from 'react'
import { SectionList, SectionListData, SectionListProps } from 'react-native'

export interface DynamicDataExpander<ID, D> {
  (ids: ID[]): Promise<{id: ID, data: D}[]>
}

type ExpansionStage = 'INITIAL' | 'BUSY' | 'READY'
type ExpansionData<ID, D> = {id: ID, data: D}
type ExpansionState<ID, D> = {
  stage: ExpansionStage
  lastIdx: number
  data: ExpansionData<ID, D>[]
}

type ExpansionAction<ID, D> = {
  type: 'INIT'
} | {
  type: 'BEGIN_EXPAND'
} | {
  type: 'FINISH_EXPAND'
  data: {id: ID, data: D}[]
  lastIdx: number
}

export type DynamicExpansionListProps<ID, D> = {
  ids: ID[]
  expander: DynamicDataExpander<ID, D>
  renderItem: (data: D) => ReactElement
  renderHeader?: () => ReactElement
  batchSize?: number
  onRefresh?: () => void
}
export function DynamicExpansionList<ID, D>({
  ids,
  expander,
  renderItem: _renderItem,
  renderHeader,
  batchSize = 10,
}: DynamicExpansionListProps<ID, D>)
{
  type SectionListSpec = SectionListProps<ExpansionData<ID, D>>
  
  function reducer(state: ExpansionState<ID, D>, action: ExpansionAction<ID, D>): ExpansionState<ID, D> {
    switch (action.type) {
      case 'INIT': {
        return {
          stage: 'READY',
          lastIdx: ids.length,
          data: [],
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
          data: state.data.concat(action.data),
        };
      }
    }
  }
  
  const INIT_STATE: ExpansionState<ID, D> = {stage: 'INITIAL', lastIdx: 0, data: []};
  const [{stage, data, lastIdx}, dispatch] = useReducer(reducer, INIT_STATE);
  const sections: SectionListData<ExpansionData<ID, D>>[] = [{data}];
  
  async function loadMore() {
    if (lastIdx === 0) return;
    if (stage !== 'READY') return;
    
    const newLastIdx = Math.max(lastIdx-batchSize, 0);
    const sublist = ids.slice(newLastIdx, lastIdx);
    
    dispatch({type: 'BEGIN_EXPAND'});
    const data = await expander(sublist);
    dispatch({type: 'FINISH_EXPAND', data, lastIdx: newLastIdx});
  }
  
  useEffect(() => {
    dispatch({type: 'INIT'});
  }, [ids]);
  useEffect(() => {
    if (stage === 'READY') {
      loadMore();
    }
  }, [stage]);
  
  const renderSectionHeader: SectionListSpec['renderSectionHeader'] = ({}) => renderHeader?.() || null
  const renderItem: SectionListSpec['renderItem'] = ({item: {data}}) => _renderItem(data);
  
  return (
    <SectionList
      {...{sections, renderItem, renderSectionHeader}}
      onEndReached={loadMore}
      onEndReachedThreshold={2}
      keyExtractor={({id}) => id+''}
    />
  )
}
