//////////////////////////////////////////////////////////////////////
// Simple Substrate API integration with RN
// -----
// SPDX-License-Identifier: GPL-3.0
import React, { useCallback, useContext, useEffect, useReducer } from 'react'
import * as Subsocial from '@subsocial/api'
import { ApiPromise } from '@polkadot/api'
import { RegistryTypes } from '@polkadot/types/types'
import { logger as createLogger } from '@polkadot/util'

const log = createLogger('SubstrateContext')

export type SubstrateProviderProps = React.PropsWithChildren<{
  endpoint: string
  types?: RegistryTypes
}>

export type SubstrateConnectionState = 'PENDING' | 'CONNECTING' | 'READY' | 'ERROR'

export type SubstrateState = {
  endpoint: string
  api?: ApiPromise
  connectionState: SubstrateConnectionState
  apiError?: any
}

type ConnectSuccessAction = {
  type: 'CONNECT_SUCCESS'
  data: ApiPromise
}

type ConnectErrorAction = {
  type: 'CONNECT_ERROR'
  data: any
}

type DisconnectAction = {
  type: 'DISCONNECT'
}

type StateAction = ConnectSuccessAction | ConnectErrorAction | DisconnectAction

export const SubstrateContext = React.createContext<SubstrateState>(undefined as unknown as SubstrateState)
export const useSubstrate = () => useContext(SubstrateContext)

export function SubstrateProvider({ children, endpoint }: SubstrateProviderProps) {
  const [ state, dispatch ] = useReducer(stateReducer, { endpoint, connectionState: 'PENDING' })
  const { api } = state
  
  const connect = useCallback(async () => {
    if (api) return
    
    try {
      const substrate = await Subsocial.getApi(endpoint)
      
      dispatch({ type: 'CONNECT_SUCCESS', data: substrate })
      substrate.on('disconnected', () => dispatch({ type: 'DISCONNECT' }))
    }
    catch (err) {
      dispatch({ type: 'CONNECT_ERROR', data: err })
    }
  }, [ api, endpoint, dispatch ]);
  
  useEffect(() => {
    connect()
  }, [])
  
  return (
    <SubstrateContext.Provider value={state}>
      {children}
    </SubstrateContext.Provider>
  )
}


function stateReducer(state: SubstrateState, action: StateAction): SubstrateState {
  switch (action.type) {
    case 'CONNECT_SUCCESS': {
      assertState(state.connectionState, 'PENDING')
      const substrate = action.data
      return { ...state, api: substrate, connectionState: 'READY' }
    }
    
    case 'CONNECT_ERROR': {
      assertState(state.connectionState, 'PENDING')
      return { ...state, connectionState: 'ERROR', apiError: action.data }
    }
    
    case 'DISCONNECT': {
      assertState(state.connectionState, 'READY')
      return { ...state, api: undefined, connectionState: 'PENDING' }
    }
    
    default:
      log.error('Unknown action type')
      return state
  }
}

function assertState(actual: SubstrateConnectionState, expected: SubstrateConnectionState, critical: boolean = false) {
  if (actual !== expected) {
    if (critical)
      throw new Error(`expected API state ${expected}, found ${actual}`)
    console.warn(`Substrate API state warning: expected ${expected}, found ${actual}`)
  }
}
