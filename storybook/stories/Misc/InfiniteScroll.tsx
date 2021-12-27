//////////////////////////////////////////////////////////////////////
// Custom list implementations to help with arbitrary InfiniteScroll
import React, { ReactElement, useMemo } from 'react'
import { Falsy, FlatList, FlatListProps, NativeScrollEvent, NativeSyntheticEvent, RefreshControl, StyleSheet, View } from 'react-native'
import { SpanningActivityIndicator } from '~comps/SpanningActivityIndicator'
import { logger as createLogger } from '@polkadot/util'
import { StateError } from 'src/types/errors'
import { Text } from '~comps/Typography'
import { start } from 'src/util/Profiler'
import { ProfilingProps } from 'src/util/Profiler/react'
import * as Profiler from 'src/util/Profiler/react'

const logger = createLogger('InfiniteScroll')

export const DEFAULT_PAGE_SIZE = 10

export interface InfiniteScrollListLoader<ID> {
  (): Promise<ID[]>
}
export interface InfiniteScrollListDataInitializer<ID> {
  (pageSize: number): [ID[], number] | Promise<[ID[], number]>
}
export interface InfiniteScrollListDataLoader<ID> {
  (page: number, pageSize: number): ID[] | Promise<ID[] | Falsy> | Falsy
}
export interface InfiniteScrollListItemLoader<ID> {
  (ids: ID[]): Promise<void> | void
}

type ListStage = 'INITIAL' | 'REFRESH' | 'BUSY' | 'READY'
type ListState<ID> = {
  stage: ListStage
  page: number
  ids: ID[]
  isEnd: boolean
}

type ListActionNotify = {
  type: 'RESET' | 'BEGIN_EXPAND' | 'BEGIN_REFRESH' | 'END_OF_LIST'
}
type ListActionInitialize<ID> = {
  type: 'INIT'
  ids: ID[]
  page?: number
}
type ListActionFinishExpand<ID> = {
  type: 'FINISH_EXPAND'
  page: number
  newIds: ID[]
}
type ListActionFinishRefresh<ID> = {
  type: 'FINISH_REFRESH'
  ids: ID[]
}
type ListAction<ID> = ListActionNotify | ListActionFinishExpand<ID> | ListActionInitialize<ID> | ListActionFinishRefresh<ID>

type ScrollEvent = NativeSyntheticEvent<NativeScrollEvent>

export type InfiniteScrollListProps<ID> = {
  loadInitial: InfiniteScrollListDataInitializer<ID>
  loadMore: InfiniteScrollListDataLoader<ID>
  loadItems: InfiniteScrollListItemLoader<ID>
  renderItem: (id: ID) => ReactElement
  refreshable?: boolean
  pageSize?: number
  onScroll?: (e: ScrollEvent) => void
  onScrollBeginDrag?: (e: ScrollEvent) => void
  onScrollEndDrag?: (e: ScrollEvent) => void
  HeaderComponent?: FlatListProps<ID>['ListHeaderComponent']
  EmptyComponent?: FlatListProps<ID>['ListEmptyComponent']
}

class InfiniteScrollListBase<ID> extends React.Component<InfiniteScrollListProps<ID> & ProfilingProps, ListState<ID>> {
  constructor(props: InfiniteScrollListProps<ID>) {
    super(props)
    
    this.state = this.getInitialState()
    this.loadInit()
  }
  
  private loadInit = async () => {
    if (this.state.stage !== 'INITIAL') throw new StateError('Cannot load initial data when not in INITIAL state')
    
    const {
      pageSize = DEFAULT_PAGE_SIZE,
      loadInitial,
    } = this.props
    
    const [ ids, page ] = await loadInitial(pageSize)
    this.dispatch({ type: 'INIT', ids, page })
  }
  
  private loadBatch = async (): Promise<[ ID[], number ]> => {
    const {
      pageSize = DEFAULT_PAGE_SIZE,
      loadMore,
      loadItems,
    } = this.props
    
    let added: ID[] = []
    let newPage = this.state.page
    const t0 = Date.now()
    let warned = false
    
    while (added.length < pageSize) {
      const more = await loadMore(newPage++, pageSize)
      if (!more) {
        this.dispatch({ type: 'END_OF_LIST' })
        break
      }
      
      added.splice(added.length, 0, ...more)
      
      if (Date.now() - t0 > 3000 && !warned) {
        logger.warn(`Loading new batch takes a while... (>${Date.now() - t0}ms)`)
        warned = true
      }
    }
    
    await loadItems(added)
    
    return [ added, newPage ]
  }
  
  loadMore = async () => {
    const {
      stage,
      isEnd,
    } = this.state
    
    if (stage !== 'READY' || isEnd) return
    
    logger.debug('loading more')
    this.dispatch({ type: 'BEGIN_EXPAND' })
    
    const [ newIds, newPage ] = await this.loadBatch()
    
    this.dispatch({ type: 'FINISH_EXPAND', newIds, page: newPage })
  }
  
  private dispatch = (action: ListAction<ID>) => {
    switch (action.type) {
      case 'RESET': {
        this.setState(this.getInitialState())
        return
      }
      
      case 'INIT': {
        this.setState({
          ...this.state,
          stage: 'READY',
          page: action.page ?? 1,
          ids: action.ids,
        })
        return
      }
      
      case 'BEGIN_EXPAND': {
        this.setState({
          ...this.state,
          stage: 'BUSY',
        })
        return
      }
      
      case 'FINISH_EXPAND': {
        this.setState({
          ...this.state,
          stage: 'READY',
          page: action.page,
          ids: this.state.ids.concat(action.newIds),
        })
        return
      }
      
      case 'BEGIN_REFRESH': {
        this.setState({
          ...this.state,
          stage: 'REFRESH',
        })
        return
      }
      
      case 'FINISH_REFRESH': {
        this.setState({
          ...this.state,
          stage: 'READY',
          ids: action.ids
        })
        return
      }
      
      case 'END_OF_LIST': {
        this.setState({
          ...this.state,
          isEnd: true,
        })
        return
      }
    }
  }
  
  private onRefresh = async () => {
    this.dispatch({ type: 'BEGIN_REFRESH' })
    
    const [ newIds ] = await this.props.loadInitial(this.props.pageSize ?? DEFAULT_PAGE_SIZE)
    
    this.dispatch({ type: 'FINISH_REFRESH', ids: newIds })
  }
  
  render() {
    const {
      profile: {
        tag,
        path,
      } = {}
    } = this.props
    
    const { stage, ids } = this.state
    const {
      refreshable = true,
      renderItem,
      HeaderComponent,
      EmptyComponent,
      onScroll,
      onScrollBeginDrag,
      onScrollEndDrag,
    } = this.props
    
    if (stage === 'INITIAL') {
      return <SpanningActivityIndicator />
    }
    
    else {
      return (
        <FlatList
          data={ids}
          renderItem={({ item: id }) => renderItem(id)}
          ListHeaderComponent={HeaderComponent}
          ListFooterComponent={<ListLoading isLoading={stage !== 'READY'} />}
          ListEmptyComponent={EmptyComponent}
          onEndReached={this.loadMore}
          onEndReachedThreshold={1}
          onScroll={onScroll}
          onScrollBeginDrag={onScrollBeginDrag}
          onScrollEndDrag={onScrollEndDrag}
          keyExtractor={(id) => id+''}
          refreshControl={refreshable
          ? <RefreshControl
              refreshing={stage === 'REFRESH'}
              onRefresh={this.onRefresh}
            />
          : undefined
          }
        />
      )
    }
  }
  
  reset() {
    this.dispatch({ type: 'RESET' })
    this.loadInit()
  }
  
  private getInitialState = (): ListState<ID> => ({
    stage: 'INITIAL',
    page: 0,
    ids: [],
    isEnd: false,
  })
  
  static bound = <ID,>() => (props: InfiniteScrollListProps<ID>) => <InfiniteScrollListBase<ID> {...props} />
}

export const InfiniteScrollList = <ID,>(props: InfiniteScrollListProps<ID>) => {
  const Comp = useMemo(() => Profiler.timed(InfiniteScrollListBase.bound<ID>(), {
    tag: 'InfiniteScrollList',
  }), [])
  return <Comp {...props} />
}

type ListLoadingProps = {
  isLoading: boolean
}
function ListLoading({ isLoading }: ListLoadingProps) {
  if (isLoading) {
    return (
      <View style={styles.listLoading}>
        <Text mode="secondary">Loading more content...</Text>
        <SpanningActivityIndicator />
      </View>
    )
  }
  else {
    return null
  }
}

const styles = StyleSheet.create({
  listLoading: {
    height: 80,
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 10,
  },
})
