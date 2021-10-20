import { Action, configureStore } from '@reduxjs/toolkit'
import { useMemo } from 'react'
import { createSelectorHook, useDispatch } from 'react-redux'
import { ThunkAction } from 'redux-thunk'
import rootReducer, { RootState } from './rootReducer'

const emptyStore = initStore()

export type AppStore = typeof emptyStore

let store: AppStore | undefined

export type AppDispatch = typeof emptyStore.dispatch

export const useAppDispatch = () => useDispatch<AppDispatch>()

export const useAppSelector = createSelectorHook<RootState>()

export type AppThunk = ThunkAction<void, RootState, unknown, Action<string>>

function initStore (preloadedState?: RootState) {
  return configureStore({
    reducer: rootReducer,
    preloadedState,
    // devTools: true,
    // middleware: (getDefaultMiddleware) =>
    //   getDefaultMiddleware({
    //     thunk: {
    //       // extraArgument: myCustomApiService,
    //       extraArgument: { hello: 'world' }
    //     },
    //     // Setting immutableCheck to false can improve performance of Redux in development mode.
    //     immutableCheck: false,
    //     // serializableCheck: false,
    //   }),
  })
}

export const initializeStore = (preloadedState?: RootState) => {
  const oldStore = store ?? initStore(preloadedState)
  return store = initStore({
    ...oldStore.getState(),
    ...preloadedState,
  })
}

export function useStore (initialState: RootState) {
  return useMemo(() => initializeStore(initialState), [ initialState ])
}
