import { useEffect } from 'react'
import { useIsFocused } from '@react-navigation/native'
import { useAppDispatch, useAppSelector } from 'src/rtk/app/hooksCommon'
import { clearReplyTo, setReplyTo } from './uiSlice'
import { PostId } from 'src/types/subsocial'
import { Opt } from 'src/types'

export const useSelectReplyTo = () => {
  return useAppSelector(state => state.ui.replyTo)
}

export const useReplyTo = (id: Opt<PostId>) => {
  const isFocused = useIsFocused()
  const dispatch  = useAppDispatch()
  useEffect(() => {
    if (isFocused && id) {
      dispatch(setReplyTo(id))
    }
    else {
      dispatch(clearReplyTo())
    }
  }, [ id, isFocused ])
}
