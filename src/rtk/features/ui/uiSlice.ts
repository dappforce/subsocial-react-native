import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { PostId } from 'src/types/subsocial'

export type UIState = {
  replyTo?: PostId
  prompt?: 'login' | 'unlock' | 'confirmTx'
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
    setPrompt: (state, action: PayloadAction<UIState['prompt']>) => {
      state.prompt = action.payload
    },
    clearPrompt: (state) => {
      delete state.prompt
    },
  },
})

export const {
  setReplyTo,
  clearReplyTo,
  setPrompt,
  clearPrompt,
} = slice.actions

export default slice.reducer
