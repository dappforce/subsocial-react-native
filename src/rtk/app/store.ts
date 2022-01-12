import { configureStore, Middleware } from '@reduxjs/toolkit'
import rootReducer from './rootReducer'

export type AppStore = typeof store
export type AppDispatch = typeof store.dispatch

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
      immutableCheck: false,
    }),
    // .concat(logger)
})
export default store
