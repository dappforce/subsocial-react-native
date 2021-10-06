//////////////////////////////////////////////////////////////////////
// Simple Substrate API integration with RN
// -----
// SPDX-License-Identifier: GPL-3.0
import React, { useCallback, useContext, useEffect, useReducer } from 'react'
import * as Subsocial from '@subsocial/api'
import { ApiPromise, WsProvider } from '@polkadot/api'
import { RegistryTypes } from '@polkadot/types/types'

type SubstrateProviderProps = React.PropsWithChildren<{
  endpoint: string
  types?: RegistryTypes
}>

type ApiState = 'PENDING' | 'CONNECTING' | 'READY' | 'ERROR'

type State = {
  endpoint: string
  api?: ApiPromise
  apiState: ApiState
  apiError?: any
}

type StateAction = {
  type: 'CONNECT_SUCCESS' | 'CONNECT_ERROR' | 'DISCONNECT'
  data?: any
}

type WithApi = {
  substrate: ApiPromise
}

export const SubstrateContext = React.createContext<State>(undefined as unknown as State);
export const useSubstrate = () => useContext(SubstrateContext);

export function SubstrateProvider(props: SubstrateProviderProps) {
  const {children, endpoint} = props;
  
  const [state, dispatch] = useReducer(stateReducer, {endpoint, apiState: 'PENDING'});
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


function stateReducer(state: State, action: StateAction): State {
  switch (action.type) {
    case 'CONNECT_SUCCESS': {
      assertState(state.apiState, 'PENDING');
      console.info(`successfully connected to Substrate endpoint ${state.endpoint}`);
      const {substrate}: WithApi = action.data;
      return {...state, api: substrate, apiState: 'READY'};
    }
    case 'CONNECT_ERROR': {
      assertState(state.apiState, 'PENDING');
      console.error(`failed to connect to Substrate endpoint ${state.endpoint}`, action.data);
      return {...state, apiState: 'ERROR', apiError: action.data};
    }
    case 'DISCONNECT': {
      assertState(state.apiState, 'READY');
      console.info(`disconnected from Substrate endpoint ${state.endpoint}`);
      return {...state, api: undefined, apiState: 'PENDING'};
    }
    default: throw new Error(`unknown action ${action.type}`);
  }
}

function assertState(actual: ApiState, expected: ApiState, critical: boolean = false) {
  if (actual !== expected) {
    if (critical)
      throw new Error(`expected API state ${expected}, found ${actual}`);
    console.warn(`Substrate API state warning: expected ${expected}, found ${actual}`);
  }
}
