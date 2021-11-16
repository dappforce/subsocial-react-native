//////////////////////////////////////////////////////////////////////
// Custom list implementations to help with arbitrary InfiniteScroll
import React, { ReactElement, useCallback, useEffect, useReducer } from 'react'
import { NativeScrollEvent, NativeSyntheticEvent, RefreshControl, SectionList, SectionListData, SectionListProps } from 'react-native'
import { setEqual } from 'src/util'
import { SpanningActivityIndicator } from '~comps/SpanningActivityIndicator'
import { logger as createLogger } from '@polkadot/util'

const logger = createLogger('InfiniteScroll')

export interface DynamicExpansionListLoader<ID> {
  (): Promise<ID[]>
}
export interface DynamicDataLoader<ID> {
  (ids: ID[]): ID[] | Promise<ID[]>
}

type ListStage = 'INITIAL' | 'REFRESH' | 'BUSY' | 'READY'
type ListState<ID> = {
  stage: ListStage
  lastIdx: number
  ids: ID[]
  baseIds: ID[]
}

type ListActionNotify = {
  type: 'BEGIN_EXPAND' | 'BEGIN_REFRESH'
}
type ListActionReset<ID> = {
  type: 'RESET'
  baseIds: ID[]
}
type ListActionInitialize<ID> = {
  type: 'INIT'
  ids: ID[]
  lastIdx: number
}
type ListActionFinishExpand<ID> = {
  type: 'FINISH_EXPAND'
  lastIdx: number
  newIds: ID[]
}
type ListActionFinishRefresh<ID> = {
  type: 'FINISH_REFRESH'
  ids: ID[]
}
type ListAction<ID> = ListActionNotify | ListActionReset<ID> | ListActionFinishExpand<ID> | ListActionInitialize<ID> | ListActionFinishRefresh<ID>

const getInitState: <ID>() => ListState<ID> = () => ({
  stage: 'INITIAL',
  lastIdx: 0,
  ids: [],
  baseIds: [],
})

type ScrollEvent = NativeSyntheticEvent<NativeScrollEvent>

export type DynamicExpansionListProps<ID> = {
  ids: ID[] | DynamicExpansionListLoader<ID>
  loader: DynamicDataLoader<ID>
  loadInitial?: () => Promise<void>
  renderEmpty?: () => ReactElement
  renderItem: (id: ID) => ReactElement
  renderHeader?: () => ReactElement
  batchSize?: number
  onScroll?: (e: ScrollEvent) => void
  onScrollBeginDrag?: (e: ScrollEvent) => void
  onScrollEndDrag?: (e: ScrollEvent) => void
}
export function DynamicExpansionList<ID>({
  ids: _ids,
  loader,
  loadInitial,
  renderEmpty,
  renderItem: _renderItem,
  renderHeader,
  batchSize = 10,
  onScroll,
  onScrollBeginDrag,
  onScrollEndDrag,
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
          baseIds: action.baseIds,
        }
      }
      
      case 'INIT': {
        return {
          ...state,
          stage: 'READY',
          lastIdx: action.lastIdx,
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
          ids: [...state.ids, ...action.newIds],
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
  
  const [ state, dispatch ] = useReducer(reducer, getInitState<ID>())
  const { stage, lastIdx, ids, baseIds } = state
  
  // TODO: Use ScrollView.HeaderComponent instead of SectionList workaround
  // I simply didn't know ScrollView supported headers
  const sections: SectionListData<ID>[] = [{ data: stage !== 'INITIAL' ? ids : [] }]
  
  async function loadBatch(ids: ID[], lastIdx: number): Promise<[ ID[], number ]> {
    if (lastIdx >= ids.length) return [ [], lastIdx ]
    
    let added: ID[] = []
    
    let newLastIdx = lastIdx
    while (added.length < batchSize && newLastIdx < ids.length) {
      const targetIdx = Math.min(newLastIdx + batchSize, ids.length)
      const sublist = ids.slice(newLastIdx, targetIdx)
      added = added.concat(await loader(sublist))
      newLastIdx = targetIdx
    }
    
    return [ added, newLastIdx ]
  }
  
  async function loadMore() {
    if (lastIdx >= baseIds.length) return
    
    if (stage !== 'READY') return
    
    logger.debug('loading more')
    dispatch({ type: 'BEGIN_EXPAND' })
    
    const [ newIds, newLastIdx ] = await loadBatch(baseIds, lastIdx)
    
    dispatch({ type: 'FINISH_EXPAND', newIds, lastIdx: newLastIdx })
  }
  
  async function loadInit(ids: ID[]) {
    await loadInitial?.()
    return await loadBatch(ids, 0)
  }
  
  useEffect(() => {
    (async() => {
      const newIds = typeof(_ids) === 'function' ? await _ids() : _ids
      
      if (!setEqual(new Set(newIds), new Set(ids))) {
        dispatch({ type: 'RESET', baseIds: newIds })
        const [ loaded, lastIdx ] = await loadInit(newIds)
        dispatch({ type: 'INIT', ids: loaded, lastIdx })
      }
    })()
  }, [ _ids ])
  
  const renderSectionHeader: SectionListSpec['renderSectionHeader'] = ({}) => renderHeader?.() || null
  const renderItem: SectionListSpec['renderItem'] = ({ item: id }) => _renderItem(id)
  
  const onRefresh = useCallback(async () => {
    if (typeof(_ids) === 'function' && stage === 'READY') {
      dispatch({ type: 'BEGIN_REFRESH' })
      
      const newIds = await _ids()
      
      dispatch({ type: 'FINISH_REFRESH', ids: newIds })
    }
  }, [ _ids ])
  
  if (stage === 'INITIAL') {
    return <SpanningActivityIndicator />
  }
  
  else if (!baseIds.length) {
    return renderEmpty?.() || null
  }
  
  else {
    return (
      <SectionList
        {...{ sections, renderItem, renderSectionHeader }}
        onEndReached={loadMore}
        onEndReachedThreshold={1}
        onScroll={onScroll}
        onScrollBeginDrag={onScrollBeginDrag}
        onScrollEndDrag={onScrollEndDrag}
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
