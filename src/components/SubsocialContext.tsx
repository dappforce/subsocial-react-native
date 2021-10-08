//////////////////////////////////////////////////////////////////////
// Simple Substrate API integration with RN
// SPDX-License-Identifier: GPL-3.0
import React, { useCallback, useContext, useMemo, useReducer, useState } from 'react'
import { SubsocialApi } from '@subsocial/api'
import { SubstrateState, useSubstrate } from './SubstrateContext'
import config from 'config.json'

export { SubstrateProvider, useSubstrate } from './SubstrateContext'

// ===== Types =====

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


// ===== Provider =====

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


// ===== QoL Hooks =====

export type SubsocialInitializerState = 'PENDING' | 'LOADING' | 'READY' | 'ERROR'
type InitializerData<T> = {
  job: SubsocialInitializerState
  data?: T
  error?: any
}

interface SubsocialInitializerCallback<T> {
  (api: SubsocialApi): T | Promise<T>
}

export function useSubsocialInitializer<T>(
  callback: SubsocialInitializerCallback<T>,
  deps: React.DependencyList
): [SubsocialInitializerState, undefined | T]
{
  const subsocial = useSubsocial();
  if (subsocial === undefined)
    throw new Error('No Subsocial API context found - are you using SubsocialProvider?');
  
  const {api} = subsocial;
  const [state, setState] = useState<InitializerData<T>>({job: 'PENDING'});
  const {job} = state;
  
  // Abuse useMemo to auto-reset initializer when deps change
  useMemo(() => {
    setState({job: 'PENDING'});
    return deps;
  }, deps);
  
  // Need callback because api may be undefined
  useCallback(async () => {
    if (!api) return;
    
    if (job !== 'PENDING') return;
    setState({job: 'LOADING'});
    try {
      setState({job: 'READY', data: await callback(api)});
    }
    catch (error) {
      setState({job: 'ERROR', error});
    }
  }, [api, state])();
  
  return [state.job, state.data];
}
