//////////////////////////////////////////////////////////////////////
// Managed infinite FlatList
import React, { useCallback, useEffect, useState } from 'react'
import { FlatList, FlatListProps, ListRenderItemInfo } from 'react-native'

export interface Loader<T> {
  (first: number, last: number): T[]
}
export interface IDExtractor<T> {
  (item: T): number
}
export interface Resetter {
  (): void
}

export type InfiniteScrollProps<T> = Omit<FlatListProps<T>, 'data' | 'keyExtractor'> & React.PropsWithChildren<{
  loader: Loader<T>
  idExtractor: IDExtractor<T>
  reset?: boolean
  onReset?: () => void
}>
export default function InfiniteScroll<T>({
  children,
  loader,
  idExtractor,
  onEndReached: _onEndReached,
  reset = false,
  onReset,
  ...props
}: InfiniteScrollProps<T>) {
  const [data, setData] = useState<T[]>([]);
  useEffect(() => {
    setData([]);
    onReset?.();
  }, [reset])
  
  const onEndReached = useCallback((info) => {
    // loader()
    _onEndReached?.(info);
  }, [data, setData, _onEndReached]);
  
  const keyExtractor = (item: T) => {
    if (typeof item === 'number' || typeof item === 'string')
      return item.toString()
    return idExtractor(item).toString()
  }
  return (
    <FlatList {...props} {...{keyExtractor, data, onEndReached}} />
  )
}
