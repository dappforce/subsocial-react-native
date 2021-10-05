//////////////////////////////////////////////////////////////////////
// Simple Substrate API integration with RN
// -----
// SPDX-License-Identifier: GPL-3.0
import React, { useCallback, useContext, useEffect, useReducer } from 'react'
import Subsocial from '@subsocial/api'
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
  type: 'CONNECT' | 'CONNECT_SUCCESS' | 'CONNECT_ERROR' | 'DISCONNECT'
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
    // const substrate = new ApiPromise({provider: new WsProvider(endpoint)});
    const substrate = await Subsocial.getApi(endpoint);
    
    substrate.on('connected', () => {
      dispatch({type: 'CONNECT', data: {substrate}})
      substrate.isReady.then(() => dispatch({type: 'CONNECT_SUCCESS', data: {substrate}}));
    });
    
    substrate.on('ready', () => dispatch({type: 'CONNECT_SUCCESS', data: {substrate}}));
    substrate.on('error', (err) => dispatch({type: 'CONNECT_ERROR', data: err}));
    substrate.on('disconnected', () => dispatch({type: 'DISCONNECT'}));
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
    case 'CONNECT': {
      console.log(`connecting to Substrate endpoint ${state.endpoint}...`);
      const {substrate}: WithApi = action.data;
      return {...state, api: substrate, apiState: 'CONNECTING'};
    }
    case 'CONNECT_SUCCESS': {
      console.info(`successfully connected to Substrate endpoint ${state.endpoint}`);
      const {substrate}: WithApi = action.data;
      return {...state, api: substrate, apiState: 'READY'};
    }
    case 'CONNECT_ERROR': {
      console.error(`failed to connect to Substrate endpoint ${state.endpoint}`, action.data);
      return {...state, apiState: 'ERROR', apiError: action.data};
    }
    case 'DISCONNECT': {
      return {...state, apiState: 'PENDING'};
    }
    default: throw new Error(`unknown action ${action.type}`);
  }
}
