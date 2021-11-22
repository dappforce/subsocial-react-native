//////////////////////////////////////////////////////////////////////
// Simple Substrate API integration with RN
// SPDX-License-Identifier: GPL-3.0
import React, { useCallback, useContext, useEffect, useReducer, useState } from 'react'
import { StyleSheet, View } from 'react-native'
import { ActivityIndicator } from 'react-native-paper'
import { SubsocialApi } from '@subsocial/api'
import { SubstrateState, useSubstrate } from './SubstrateContext'
import config from 'config.json'
import { useTheme } from './Theming'
import { Text } from './Typography'

export { SubstrateProvider, useSubstrate } from './SubstrateContext'

// ===== Types =====

type SubsocialConnectionState = 'PENDING' | 'CONNECTED' | 'ERROR'

export type SubsocialState = React.PropsWithChildren<{
  substrate: SubstrateState
  api: SubsocialApi
  apiError?: any
  connectionState: SubsocialConnectionState
}>

type StateActionType = 'CONNECT' | 'ERROR'
type StateAction = {
  type: StateActionType
  data: any
}

export const SubsocialContext = React.createContext<SubsocialState>(undefined as unknown as SubsocialState)
export const useSubsocial = () => useContext(SubsocialContext)


// ===== Provider =====

export type SubsocialProviderProps = React.PropsWithChildren<{}>

export function SubsocialProvider({ children }: SubsocialProviderProps) {
  const substrate = useSubstrate()
  const theme = useTheme()
  const [ state, dispatch ] = useReducer(stateReducer, { substrate, api: null as unknown as SubsocialApi, connectionState: 'PENDING' })
  const { api, apiError } = state
  
  useEffect(() => {
    switch (substrate?.connectionState) {
      case 'READY': {
        if (!api) dispatch({ type: 'CONNECT', data: { substrate } })
        break
      }
      case 'ERROR': {
        dispatch({ type: 'ERROR', data: substrate.apiError })
        console.error(substrate.apiError)
        break
      }
    }
  }, [ substrate?.connectionState ])
  
  if (!api && !apiError) {
    return (
      <View style={styles.coverContainer}>
        <Text style={styles.centerText}>
          Connecting to the network ...
        </Text>
        <ActivityIndicator color={theme.colors.primary} />
      </View>
    )
  }
  
  else if (apiError) {
    return (
      <View style={styles.coverContainer}>
        <Text style={[styles.centerText, { fontFamily: 'RobotoMedium' }]}>
          An error occurred while attempting to connect to the network.
        </Text>
        <Text style={styles.centerText}>
          The gateway node may be temporarily unavailable. Otherwise, please ensure you enjoy a stable Internet connection.
        </Text>
      </View>
    )
  }
  
  else {
    return (
      <SubsocialContext.Provider value={state}>
        {children}
      </SubsocialContext.Provider>
    )
  }
}

function stateReducer(state: SubsocialState, action: StateAction): SubsocialState {
  switch (action.type) {
    case 'CONNECT': {
      if (state.connectionState !== 'PENDING') {
        console.error('duplicate connect dispatch')
      }
      
      else {
        const {substrate}: {substrate: SubstrateState} = action.data
        const api = new SubsocialApi({
          substrateApi: substrate.api!,
          ipfsNodeUrl: config.connections.ipfs,
          offchainUrl: config.connections.ws.offchain,
        })
        
        return { ...state, api, connectionState: 'CONNECTED' }
      }
    }
    case 'ERROR': {
      return { ...state, api: null as unknown as SubsocialApi, apiError: action.data, connectionState: 'ERROR' }
    }
    default: throw new Error(`unknown Subsocial context action ${action.type}`)
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

// TODO: useEffect-style unmount
export function useSubsocialEffect<T>(
  callback: SubsocialInitializerCallback<T>,
  deps: React.DependencyList
): [SubsocialInitializerState, undefined | T]
{
  const subsocial = useSubsocial()
  if (subsocial === undefined)
    throw new Error('No Subsocial API context found - are you using SubsocialProvider?')
  
  const { api } = subsocial
  const [ state, setState ] = useState<InitializerData<T>>({ job: 'PENDING' })
  const { job } = state
  
  // Auto-reset initializer when deps change
  useEffect(() => {
    setState({ job: 'PENDING' })
  }, deps)
  
  // Need callback because api may be undefined
  useCallback(async () => {
    if (!api) return
    
    if (job !== 'PENDING') return
    
    setState({ job: 'LOADING' })
    try {
      setState({ job: 'READY', data: await callback(api) })
    }
    catch (error) {
      setState({ job: 'ERROR', error })
      throw error
    }
  }, [ api, state ])()
  
  return [state.job, state.data];
}

export function isLoading(state: SubsocialInitializerState) {
  switch (state) {
    case 'PENDING':
    case 'LOADING':
      return true
      
    default:
      return false
  }
}

export const isReady = (state: SubsocialInitializerState) => state === 'READY'
export const isError = (state: SubsocialInitializerState) => state === 'ERROR'

const styles = StyleSheet.create({
  coverContainer: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
  },
  centerText: {
    textAlign: 'center',
    maxWidth: '80%',
    marginBottom: 20,
  },
})
