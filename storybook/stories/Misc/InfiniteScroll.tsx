//////////////////////////////////////////////////////////////////////
// Custom list implementations to help with arbitrary InfiniteScroll
import React, { ReactElement, useCallback, useEffect, useReducer } from 'react'
import { RefreshControl, SectionList, SectionListData, SectionListProps } from 'react-native'
import { setEqual } from 'src/util'
import { SpanningActivityIndicator } from '~comps/SpanningActivityIndicator'

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

type ListActionNotify = {
  type: 'RESET' | 'BEGIN_EXPAND' | 'BEGIN_REFRESH'
}
type ListActionInitialize<ID> = {
  type: 'INIT'
  ids: ID[]
  initialSize: number
}
type ListActionFinishExpand = {
  type: 'FINISH_EXPAND'
  lastIdx: number
}
type ListActionFinishRefresh<ID> = {
  type: 'FINISH_REFRESH'
  ids: ID[]
}
type ListAction<ID> = ListActionNotify | ListActionFinishExpand | ListActionInitialize<ID> | ListActionFinishRefresh<ID>

const getInitState: <ID>() => ListState<ID> = () => ({
  stage: 'INITIAL',
  lastIdx: 0,
  ids: [],
})

export type DynamicExpansionListProps<ID> = {
  ids: ID[] | DynamicExpansionListLoader<ID>
  loader: DynamicDataLoader<ID>
  loadInitial?: () => Promise<void>
  renderItem: (id: ID) => ReactElement
  renderHeader?: () => ReactElement
  batchSize?: number
  onRefresh?: () => void
}
export function DynamicExpansionList<ID>({
  ids: _ids,
  loader,
  loadInitial,
  renderItem: _renderItem,
  renderHeader,
  batchSize = 10,
}: DynamicExpansionListProps<ID>)
{
  type SectionListSpec = SectionListProps<ID>
  
  function reducer(state: ListState<ID>, action: ListAction<ID>): ListState<ID> {
    switch (action.type) {
      case 'RESET': {
        return {
          ...state,
          stage: 'INITIAL',
          lastIdx: 0,
          ids: [],
        }
      }
      case 'INIT': {
        return {
          ...state,
          stage: 'READY',
          lastIdx: action.initialSize,
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
  
  const sections: SectionListData<ID>[] = [{data: stage !== 'INITIAL' ? ids.slice(0, lastIdx) : []}]
  
  async function loadMore() {
    if (lastIdx >= ids.length) return
    if (stage !== 'READY') return
    console.log('loading more')
    
    const newLastIdx = Math.min(lastIdx+batchSize, ids.length)
    const sublist = ids.slice(lastIdx, newLastIdx)
    
    dispatch({type: 'BEGIN_EXPAND'})
    await loader(sublist)
    dispatch({type: 'FINISH_EXPAND', lastIdx: newLastIdx})
  }
  
  async function loadInit(ids: ID[]) {
    const sublist = ids.slice(0, batchSize)
    await loadInitial?.()
    await loader(sublist)
    return sublist
  }
  
  useEffect(() => {
    (async() => {
      const newIds = typeof(_ids) === 'function' ? await _ids() : _ids
      if (!setEqual(new Set(newIds), new Set(ids))) {
        dispatch({type: 'RESET'})
        const loaded = await loadInit(newIds)
        dispatch({type: 'INIT', ids: newIds, initialSize: loaded.length})
      }
    })()
  }, [_ids])
  
  const renderSectionHeader: SectionListSpec['renderSectionHeader'] = ({}) => renderHeader?.() || null
  const renderItem: SectionListSpec['renderItem'] = ({item: id}) => _renderItem(id);
  const onRefresh = useCallback(async () => {
    if (typeof(_ids) === 'function' && stage === 'READY') {
      dispatch({type: 'BEGIN_REFRESH'})
      
      const newIds = await _ids()
      
      dispatch({type: 'FINISH_REFRESH', ids: newIds})
    }
  }, [_ids])
  
  if (stage === 'INITIAL') {
    return <SpanningActivityIndicator />
  }
  else {
    return (
      <SectionList
        {...{sections, renderItem, renderSectionHeader}}
        onEndReached={loadMore}
        onEndReachedThreshold={1}
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
}
