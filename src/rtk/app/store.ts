import { Action, configureStore, MiddlewareArray } from '@reduxjs/toolkit'
import thunk, { ThunkAction } from 'redux-thunk'
import rootReducer, { RootState } from './rootReducer'

export type AppStore = typeof store
export type AppDispatch = typeof store.dispatch
export type AppThunk = ThunkAction<void, RootState, unknown, Action<string>>

const store = configureStore({
  reducer: rootReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    })
})
export default store
