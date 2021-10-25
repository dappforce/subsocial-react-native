//////////////////////////////////////////////////////////////////////
// Custom list implementations to help with arbitrary InfiniteScroll
import React, { ReactElement, useCallback, useEffect, useReducer, useState } from 'react'
import { RefreshControl, SectionList, SectionListData, SectionListProps } from 'react-native'
import { async } from 'rxjs'
import { setEqual } from 'src/util'
import { useInit } from '~comps/hooks'

export interface DynamicExpansionListLoader<ID> {
  (): Promise<ID[]>
}
export interface DynamicDataLoader<ID> {
  (ids: ID[]): void
}

type ListStage = 'INITIAL' | 'REFRESH' | 'BUSY' | 'READY'
type ListState<ID> = {
  stage: ListStage
  lastIdx: number
  ids: ID[]
}

type ListAction<ID> = {
  type: 'BEGIN_EXPAND' | 'BEGIN_REFRESH'
} | {
  type: 'FINISH_EXPAND'
  lastIdx: number
} | {
  type: 'INIT' | 'FINISH_REFRESH'
  ids: ID[]
}

const getInitState: <ID>() => ListState<ID> = () => ({
  stage: 'INITIAL',
  lastIdx: 0,
  ids: [],
})

export type DynamicExpansionListProps<ID> = {
  ids: ID[] | DynamicExpansionListLoader<ID>
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
  
  function reducer(state: ListState<ID>, action: ListAction<ID>): ListState<ID> {
    switch (action.type) {
      case 'INIT': {
        return {
          ...state,
          stage: 'READY',
          lastIdx: 0,
          ids: action.ids,
        }
      }
      case 'BEGIN_EXPAND': {
        return {
          ...state,
          stage: 'BUSY',
        }
      }
      case 'FINISH_EXPAND': {
        return {
          ...state,
          stage: 'READY',
          lastIdx: action.lastIdx,
        }
      }
      case 'BEGIN_REFRESH': {
        return {
          ...state,
          stage: 'REFRESH',
        }
      }
      case 'FINISH_REFRESH': {
        return {
          ...state,
          stage: 'READY',
          ids: action.ids
        }
      }
    }
  }
  
  const [state, dispatch] = useReducer(reducer, getInitState<ID>())
  const {stage, lastIdx, ids} = state
  
  const sections: SectionListData<ID>[] = [{data: stage !== 'INITIAL' ? ids.slice(lastIdx) : []}]
  
  async function loadMore() {
    if (lastIdx === 0) return;
    if (stage !== 'READY') return;
    
    const newLastIdx = Math.max(lastIdx+batchSize, 0);
    const sublist = ids.slice(lastIdx, newLastIdx);
    
    dispatch({type: 'BEGIN_EXPAND'})
    await loader(sublist)
    dispatch({type: 'FINISH_EXPAND', lastIdx: newLastIdx})
  }
  
  useEffect(() => {
    (async() => {
      const newIds = typeof(_ids) === 'function' ? await _ids() : _ids
      if (!setEqual(new Set(newIds), new Set(ids))) {
        dispatch({type: 'INIT', ids: newIds})
      }
    })()
  }, [_ids])
  
  useInit(() => {
    if (stage !== 'READY') return false
    
    // assume no change if lastIdx wasn't reset to 0 by useEffect above
    if (lastIdx !== 0) return true
    
    loadMore()
    return true
  }, [_ids], [stage])
  
  const renderSectionHeader: SectionListSpec['renderSectionHeader'] = ({}) => renderHeader?.() || null
  const renderItem: SectionListSpec['renderItem'] = ({item: id}) => _renderItem(id);
  const onRefresh = useCallback(async () => {
    if (typeof(_ids) === 'function' && stage === 'READY') {
      dispatch({type: 'BEGIN_REFRESH'})
      
      const newIds = await _ids()
      
      dispatch({type: 'FINISH_REFRESH', ids: newIds})
    }
  }, [_ids])
  
  return (
    <SectionList
      {...{sections, renderItem, renderSectionHeader}}
      onEndReached={loadMore}
      onEndReachedThreshold={2}
      keyExtractor={(id) => id+''}
      refreshControl={typeof(_ids) === 'function'
      ? <RefreshControl
          refreshing={stage === 'REFRESH'}
          onRefresh={onRefresh}
        />
      : undefined
      }
    />
  )
}
