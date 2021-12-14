import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { PostId } from 'src/types/subsocial'

export type UIState = {
  replyTo?: PostId
}

const SLICE = 'ui'

const initialState: UIState = {
  
}

const slice = createSlice({
  name: SLICE,
  initialState,
  reducers: {
    setReplyTo: (state, action: PayloadAction<PostId>) => {
      state.replyTo = action.payload
    },
    clearReplyTo: (state) => {
      delete state.replyTo
    },
  },
})

export const {
  setReplyTo,
  clearReplyTo,
} = slice.actions

export default slice.reducer
