import { useEffect } from 'react'
import { useStore } from 'react-redux'
import { useIsFocused } from '@react-navigation/native'
import { useAppDispatch, useAppSelector } from 'src/rtk/app/hooksCommon'
import { clearReplyTo, setReplyTo } from './uiSlice'
import { PostId } from 'src/types/subsocial'
import { Opt } from 'src/types'
import type { RootState } from 'src/rtk/app/rootReducer'

export const useSelectReplyTo = () => {
  return useAppSelector(state => state.ui.replyTo)
}

export const useReplyTo = (id: Opt<PostId>) => {
  const store = useStore<RootState>()
  const isFocused = useIsFocused()
  const dispatch  = useAppDispatch()
  useEffect(() => {
    if (id) {
      if (isFocused) {
        dispatch(setReplyTo(id))
      }
      else if (store.getState().ui.replyTo === id) {
        dispatch(clearReplyTo())
      }
    }
  }, [ id, isFocused ])
}
