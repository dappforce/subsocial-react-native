import { AsyncThunkAction } from '@reduxjs/toolkit'
import { isEmptyArray, newLogger } from '@subsocial/utils'
import { useRef, useState } from 'react'
import { createSelectorHook, shallowEqual, useDispatch } from 'react-redux'
import { useSubsocialInit } from '~comps/SubsocialContext'
import isDeepEqual from 'fast-deep-equal/es6'
import type { RootState } from './rootReducer'
import type { AppDispatch } from 'src/rtk/app/store'
import type { ApiArg, FetchManyArgs, FetchOneArgs, SelectManyArgs, SelectOneArgs, ThunkApiConfig } from 'src/rtk/app/helpers'

const log = newLogger('useFetchEntities')

type CommonResult = {
  loading?: boolean
  error?: Error
}

export type FetchCommonResult<T> = T & CommonResult

type FetchOneResult<Entity> = FetchCommonResult<{
  entity?: Entity
}>

export type FetchManyResult<Entity> = FetchCommonResult<{
  entities: Entity[]
}>

type SelectFn<Args, Entity> = (state: RootState, args: Args) => Entity

export type SelectManyFn<Args, Entity> = SelectFn<SelectManyArgs<Args>, Entity[]>
export type SelectOneFn<Args, Entity> = (state: RootState, args: SelectOneArgs<Args>) => Entity

type FetchFn<Args, Struct> = (args: Args) =>
  AsyncThunkAction<Struct, Args, ThunkApiConfig>

export type FetchManyFn<Args, Struct> = FetchFn<FetchManyArgs<Args>, Struct[]>
export type FetchOneFn<Args, Struct> = FetchFn<FetchOneArgs<Args>, Struct>

export function useFetch<Args, Struct> (
  fetch: FetchFn<Args, Struct>,
  args: Omit<Args, 'api'> | Partial<ApiArg>,
): CommonResult
{
  const [ loading, setLoading ] = useState(true)
  const [ error, setError ] = useState<Error>()
  const dispatch = useAppDispatch()
  const refArgs = useRef(args)
  
  if (!isDeepEqual(args, refArgs.current)) {
    refArgs.current = args
  }
  
  useSubsocialInit(async (isMounted, { api }) => {
    log.debug('useFetch: args:', args)
    setError(undefined)
    
    try {
      await dispatch(fetch({ ...args, api } as unknown as Args))
    }
    catch (err: any) {
      if (isMounted()) {
        setError(err)
        log.error(error)
      }
    }
    finally {
      if (isMounted()) {
        setLoading(false)
      }
    }
    
    return true
  }, [ refArgs ], [])

  return {
    loading,
    error,
  }
}

export function useFetchEntities<Args, Struct, Entity> (
  select: SelectManyFn<Args, Entity>,
  fetch: FetchManyFn<Args, Struct>,
  args: SelectManyArgs<Args>
): FetchManyResult<Entity> {

  const hasNoIds = isEmptyArray(args.ids)
  const entities = useAppSelector(state => hasNoIds ? [] : select(state, args), shallowEqual)

  // TODO think how get rid of "as any"
  const { loading, error } = useFetch(fetch as any, args)

  return {
    loading,
    error,
    entities,
  }
}

export function useFetchOneEntity<Args, Struct, Entity> (
  select: SelectOneFn<Args, Entity>,
  fetch: FetchOneFn<Args, Struct>,
  args: SelectOneArgs<Args>
): FetchOneResult<Entity> {

  const entity = useAppSelector(state => select(state, args), shallowEqual)

  // TODO think how get rid of "as any"
  const { loading, error } = useFetch(fetch as any, args)

  return {
    loading,
    error,
    entity,
  }
}

type UseSelectFn<Entity> = (id: string) => Entity

export function useFetchEntity<Args, Struct, Entity> (
  useSelect: UseSelectFn<Entity>,
  fetch: FetchManyFn<Args, Struct>,
  args: SelectOneArgs<Args>
): FetchOneResult<Entity> {

  const { id, ..._rest } = args
  const rest = _rest as unknown as Args
  const selectManyArgs = { ids: [ id ], ...rest } as any // TODO think use without any
  const entity = useSelect(id.toString())
  const { ...props } = useFetch(fetch, selectManyArgs)

  return {
    ...props,
    entity
  }
}

export const useAppDispatch = () => useDispatch<AppDispatch>()
export const useAppSelector = createSelectorHook<RootState>()
