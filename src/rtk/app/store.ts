import { Action, configureStore, Middleware } from '@reduxjs/toolkit'
import { ThunkAction } from 'redux-thunk'
import rootReducer, { RootState } from './rootReducer'

export type AppStore = typeof store
export type AppDispatch = typeof store.dispatch
export type AppThunk = ThunkAction<void, RootState, unknown, Action<string>>

const logger: Middleware = store => next => action => {
  console.group(action.type)
  const result = next(action)
  console.groupEnd()
  return result
}

const store = configureStore({
  reducer: rootReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    })
      // .concat(logger)
})
export default store
