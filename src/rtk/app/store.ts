import { Action, configureStore } from '@reduxjs/toolkit'
import { createSelectorHook, useDispatch } from 'react-redux'
import { ThunkAction } from 'redux-thunk'
import rootReducer, { RootState } from './rootReducer'

export type AppStore = typeof store
export type AppDispatch = typeof store.dispatch
export type AppThunk = ThunkAction<void, RootState, unknown, Action<string>>

const store = configureStore({
  reducer: rootReducer,
})
export default store

export const useAppDispatch = () => useDispatch<AppDispatch>()
export const useAppSelector = createSelectorHook<RootState>()
