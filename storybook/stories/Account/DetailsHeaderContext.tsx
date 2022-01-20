import React, { useCallback, useReducer } from 'react'
import { NativeScrollEvent, NativeSyntheticEvent } from 'react-native'

type ScrollEvent = NativeSyntheticEvent<NativeScrollEvent>

export type DetailsHeaderInternalState = {
  collapsed: boolean
  canCollapse: boolean
  dragging: boolean
}
export type DetailsHeaderState = DetailsHeaderInternalState & {
  onScroll: (e: ScrollEvent) => void
  onScrollBeginDrag: (e: ScrollEvent) => void
  onScrollEndDrag: (e: ScrollEvent) => void
}

type DetailsHeaderAction = {
  type: 'BEGIN_DRAG' | 'END_DRAG' | 'COLLAPSE' | 'EXPAND'
}

export const DetailsHeaderContext = React.createContext(undefined as unknown as DetailsHeaderState)

export type DetailsHeaderProviderProps = React.PropsWithChildren<{}>
export function DetailsHeaderProvider({ children }: DetailsHeaderProviderProps) {
  const [ state, dispatch ] = useReducer(reducer, {
    collapsed: false,
    canCollapse: true,
    dragging: false,
  })
  
  const { collapsed, canCollapse } = state
  
  const onScroll = useCallback<DetailsHeaderState['onScroll']>(({ nativeEvent: { contentOffset } }) => {
    if (canCollapse) {
      if (!collapsed && contentOffset.y > 1) {
        dispatch({ type: 'COLLAPSE' })
      }
      else if (collapsed && contentOffset.y < 1) {
        dispatch({ type: 'EXPAND' })
      }
    }
  }, [ dispatch, collapsed, canCollapse ])
  
  const onScrollBeginDrag = useCallback(() => {
    dispatch({ type: 'BEGIN_DRAG' })
  }, [ dispatch ])
  
  const onScrollEndDrag = useCallback<DetailsHeaderState['onScrollEndDrag']>(({ nativeEvent: { contentOffset } }) => {
    if (contentOffset.y < 1) {
      dispatch({ type: 'EXPAND' })
    }
    else {
      dispatch({ type: 'COLLAPSE' })
    }
    dispatch({ type: 'END_DRAG' })
  }, [ dispatch ])
  
  return (
    <DetailsHeaderContext.Provider value={{ ...state, onScroll, onScrollBeginDrag, onScrollEndDrag }}>
      {children}
    </DetailsHeaderContext.Provider>
  )
}

function reducer(state: DetailsHeaderInternalState, action: DetailsHeaderAction): DetailsHeaderInternalState {
  switch (action.type) {
    case 'BEGIN_DRAG': {
      return {
        ...state,
        dragging: true,
        canCollapse: true,
      }
    }
    
    case 'END_DRAG': {
      return {
        ...state,
        dragging: false,
        canCollapse: true,
      }
    }
    
    case 'COLLAPSE': {
      return {
        ...state,
        collapsed: true,
        canCollapse: false,
      }
    }
    
    case 'EXPAND': {
      return {
        ...state,
        collapsed: false,
        canCollapse: false,
      }
    }
  }
}

export const useDetailsHeader = () => React.useContext(DetailsHeaderContext)
