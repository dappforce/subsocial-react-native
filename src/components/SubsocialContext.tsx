//////////////////////////////////////////////////////////////////////
// Simple Substrate API integration with RN
// SPDX-License-Identifier: GPL-3.0
import React, { useContext, useReducer } from 'react'
import { SubsocialApi } from '@subsocial/api'
import { SubstrateState, useSubstrate } from "./SubstrateContext"
import config from 'config.json'

type SubsocialConnectionState = 'PENDING' | 'CONNECTED' | 'ERROR'

export type SubsocialState = React.PropsWithChildren<{
  substrate: SubstrateState
  api?: SubsocialApi
  apiError?: any
  connectionState: SubsocialConnectionState
}>

type StateActionType = 'CONNECT' | 'ERROR'
type StateAction = {
  type: StateActionType
  data: any
}

export const SubsocialContext = React.createContext<SubsocialState>(undefined as unknown as SubsocialState)
export const useSubsocial = () => useContext(SubsocialContext);

export type SubsocialProviderProps = React.PropsWithChildren<{}>

export function SubsocialProvider({children}: SubsocialProviderProps) {
  const substrate = useSubstrate();
  const [state, dispatch] = useReducer(stateReducer, {substrate, api: undefined, connectionState: 'PENDING'});
  const {api} = state;
  
  switch (substrate?.connectionState) {
    case 'READY': {
      if (!api) dispatch({type: 'CONNECT', data: {substrate}});
      break;
    }
    case 'ERROR': {
      dispatch({type: 'ERROR', data: substrate.apiError});
      break;
    }
  }
  
  return (
    <SubsocialContext.Provider value={state}>
      {children}
    </SubsocialContext.Provider>
  )
}

function stateReducer(state: SubsocialState, action: StateAction): SubsocialState {
  switch (action.type) {
    case 'CONNECT': {
      if (state.connectionState !== 'PENDING') {
        console.error('duplicate connect dispatch')
      }
      else {
        const {substrate}: {substrate: SubstrateState} = action.data;
        const api = new SubsocialApi({
          substrateApi: substrate.api!,
          ipfsNodeUrl: config.connections.ipfs,
          offchainUrl: config.connections.ws.offchain,
        });
        return {...state, api, connectionState: 'CONNECTED'};
      }
    }
    case 'ERROR': {
      return {...state, api: undefined, apiError: action.data, connectionState: 'ERROR'};
    }
    default: throw new Error(`unknown Subsocial context action ${action.type}`);
  }
}
