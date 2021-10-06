//////////////////////////////////////////////////////////////////////
// Simple Substrate API integration with RN
// -----
// SPDX-License-Identifier: GPL-3.0
import React, { useCallback, useContext, useEffect, useReducer } from 'react'
import * as Subsocial from '@subsocial/api'
import { ApiPromise, WsProvider } from '@polkadot/api'
import { RegistryTypes } from '@polkadot/types/types'

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

type StateAction = {
  type: 'CONNECT_SUCCESS' | 'CONNECT_ERROR' | 'DISCONNECT'
  data?: any
}

type WithApi = {
  substrate: ApiPromise
}

export const SubstrateContext = React.createContext<SubstrateState>(undefined as unknown as SubstrateState);
export const useSubstrate = () => useContext(SubstrateContext);

export function SubstrateProvider(props: SubstrateProviderProps) {
  const {children, endpoint} = props;
  
  const [state, dispatch] = useReducer(stateReducer, {endpoint, connectionState: 'PENDING'});
  const {api} = state;
  
  const connect = useCallback(async () => {
    if (api) return;
    try {
      const substrate = await Subsocial.getApi(endpoint);
      dispatch({type: 'CONNECT_SUCCESS', data: {substrate}});
      substrate.on('disconnected', () => dispatch({type: 'DISCONNECT'}));
    }
    catch (err) {
      dispatch({type: 'CONNECT_ERROR', data: err});
    }
  }, [api, endpoint, dispatch]);
  
  useEffect(() => {
    connect();
  }, []);
  
  return (
    <SubstrateContext.Provider value={state}>
      {children}
    </SubstrateContext.Provider>
  )
}


function stateReducer(state: SubstrateState, action: StateAction): SubstrateState {
  switch (action.type) {
    case 'CONNECT_SUCCESS': {
      assertState(state.connectionState, 'PENDING');
      const {substrate}: WithApi = action.data;
      return {...state, api: substrate, connectionState: 'READY'};
    }
    case 'CONNECT_ERROR': {
      assertState(state.connectionState, 'PENDING');
      return {...state, connectionState: 'ERROR', apiError: action.data};
    }
    case 'DISCONNECT': {
      assertState(state.connectionState, 'READY');
      return {...state, api: undefined, connectionState: 'PENDING'};
    }
    default: throw new Error(`unknown action ${action.type}`);
  }
}

function assertState(actual: SubstrateConnectionState, expected: SubstrateConnectionState, critical: boolean = false) {
  if (actual !== expected) {
    if (critical)
      throw new Error(`expected API state ${expected}, found ${actual}`);
    console.warn(`Substrate API state warning: expected ${expected}, found ${actual}`);
  }
}
