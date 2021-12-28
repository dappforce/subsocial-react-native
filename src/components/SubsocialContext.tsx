//////////////////////////////////////////////////////////////////////
// Simple Substrate API integration with RN
// SPDX-License-Identifier: GPL-3.0
import React, { EffectCallback, MutableRefObject, useContext, useEffect, useReducer } from 'react'
import { StyleSheet, View } from 'react-native'
import { ActivityIndicator } from 'react-native-paper'
import { ApiPromise } from '@polkadot/api'
import { SubsocialApi } from '@subsocial/api'
import { SubstrateState, useSubstrate } from './SubstrateContext'
import { useTheme } from './Theming'
import { Text } from './Typography'
import { assertDefined } from 'src/util/assert'
import config from 'config.json'
import { useInit } from './hooks'
import { logger as createLogger } from '@polkadot/util'

export { SubstrateProvider, useSubstrate } from './SubstrateContext'

const log = createLogger('SubsocialContext')

// ===== Types =====

type SubsocialConnectionState = 'PENDING' | 'CONNECTED' | 'ERROR'

export type SubsocialState = React.PropsWithChildren<{
  substrate: SubstrateState
  api: SubsocialApi
  apiError?: any
  connectionState: SubsocialConnectionState
}>

type ConnectAction = {
  type: 'CONNECT'
  data: SubstrateState
}

type ErrorAction = {
  type: 'ERROR'
  data: any
}

type StateAction = ConnectAction | ErrorAction

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
        if (api) {
          log.debug('Already connected to Subsocial API')
        }
        else {
          dispatch({ type: 'CONNECT', data: substrate })
        }
        break
      }
      case 'ERROR': {
        dispatch({ type: 'ERROR', data: substrate.apiError })
        log.error(substrate.apiError)
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
        const substrate = action.data
        if (!substrate.api) {
          log.error('no api in substrate state')
          return state
        }
        
        const api = new SubsocialApi({
          substrateApi: substrate.api,
          ipfsNodeUrl: config.connections.ipfs,
          offchainUrl: config.connections.rpc.offchain,
        })
        
        return {
          ...state,
          substrate,
          api,
          connectionState: 'CONNECTED'
        }
      }
    }
    case 'ERROR': {
      return {
        ...state,
        api: null as unknown as SubsocialApi,
        apiError: action.data,
        connectionState: 'ERROR'
      }
    }
    default:
      log.error('Unhandled action type')
      return state
  }
}


// ===== QoL Hooks =====

interface SubsocialEffect {
  (args: { api: SubsocialApi, substrate: ApiPromise }): ReturnType<EffectCallback>
}

export function useSubsocialEffect(
  callback: SubsocialEffect,
  deps: React.DependencyList
): void
{
  const subsocial = useSubsocial()
  if (subsocial === undefined)
    throw new Error('No Subsocial API context found - are you using SubsocialProvider?')
  
  const { api, substrate: { api: substrate } } = subsocial
  
  useEffect(() => {
    assertDefined(api, 'Subsocial API unavailable')
    assertDefined(substrate, 'Subsocial Substrate API unavailable')
    
    return callback({ api, substrate })
  }, [ api, substrate, ...deps ])
}

interface SubsocialInit {
  (isMounted: () => boolean, args: { api: SubsocialApi, substrate: ApiPromise }): boolean | Promise<boolean>
}

export function useSubsocialInit(
  callback: SubsocialInit,
  resetDeps: React.DependencyList,
  retryDeps: React.DependencyList,
): boolean
{
  const subsocial = useSubsocial()
  if (subsocial === undefined)
    throw new Error('No Subsocial API context found - are you using SubsocialProvider?')
  
  return useInit(async(isMounted) => {
    const { api, substrate: { api: substrate } } = subsocial
    
    console.log(subsocial.substrate)
    assertDefined(api, 'Subsocial API unavailable')
    assertDefined(substrate, 'Subsocial Substrate API unavailable')
    
    return await callback(isMounted, { api, substrate })
  }, [ subsocial, ...resetDeps ], retryDeps)
}

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
