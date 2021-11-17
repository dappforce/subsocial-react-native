//////////////////////////////////////////////////////////////////////
// Custom Crypto Keychain (w/o Polkadot SDK) directly leveraging
// native secure storage.
// -----
// We don't store seed phrases / mnemonics, because these could
// theoretically be used across blockchains. Better generate keypair
// specifically for SubsocialRN.
// -----
// I have no clue if a cross-app wallet exists. So far, all wallets
// come with their own Dapp browsers. Would be neat, though. Probably
// requires OAuth-like deep linking.
import { createHash } from 'crypto'

import { Falsy } from 'react-native'
import { createAsyncThunk, createSlice, isRejectedWithValue } from '@reduxjs/toolkit'
import { newLogger } from '@subsocial/utils'
import { AccountId } from 'src/types/subsocial'
import { Opt } from 'src/types'
import { asAccountId } from '@subsocial/api'
import * as SecureStore from 'expo-secure-store'
import { Keyring } from '@polkadot/keyring'
import { RootState } from 'src/rtk/app/rootReducer'

const log = newLogger('LocalAccountSlice')

const STORE_KEYPAIR  = 'df.keyring'
const STORE_PASSHASH = 'df.passhash'
const STORE_NONCE    = 'df.clientNonce'

export class NoKeypairError extends Error {
  constructor() {
    super('No keyring stored')
    this.name = 'NoKeyringError'
  }
}

type ThunkApiConfig = {
  state: {
    localAccount: LocalAccountState
  }
  rejectValue: Error
}

export type Keypair = ReturnType<Keyring['getPair']>
type KeypairJson = ReturnType<Keyring['toJson']>

// do not store secret in memory for security probably
// ask slice to sign instead
type LocalAccountState = {
  keypair?: Keypair
  nonce?: number
}

export const loadKeypair = createAsyncThunk<Keypair, string | undefined, { rejectValue: NoKeypairError | Error }>(
  'localAccount/loadKeypair',
  async (passphrase, { rejectWithValue }) => {
    const checkHash = await SecureStore.getItemAsync(STORE_PASSHASH)
    if (passphrase && digestPassphrase(passphrase) !== checkHash)
      return rejectWithValue(new Error('Invalid passphrase'))
    
    const keypairJsonStr = await SecureStore.getItemAsync(STORE_KEYPAIR)
    if (!keypairJsonStr)
      return rejectWithValue(new NoKeypairError())
    
    const keyringJson = JSON.parse(keypairJsonStr) as KeypairJson
    return new Keyring().createFromJson(keyringJson)
  }
)

export type ImportKeypairArgs = {
  json: string
  passphrase?: string
}
export const importKeypair = createAsyncThunk<Keypair, ImportKeypairArgs, ThunkApiConfig>(
  'localAccount/importKeypair',
  async ({ json, passphrase }) => {
    const keypair = new Keyring().createFromJson(JSON.parse(json))
    const passhash = passphrase && digestPassphrase(passphrase) || ''
    
    await Promise.all([
      SecureStore.setItemAsync(STORE_PASSHASH, passhash),
      SecureStore.setItemAsync(STORE_KEYPAIR, json)
    ])
    
    return keypair
  }
)

export type StoreKeypairArgs = {
  keypair: Keypair
  passphrase?: string
}
export const storeKeypair = createAsyncThunk<Keypair, StoreKeypairArgs, ThunkApiConfig>(
  'localAccount/storeKeypair',
  async ({ keypair, passphrase }) => {
    const passhash = passphrase && digestPassphrase(passphrase) || ''
    const json = JSON.stringify(keypair.toJson(passphrase))
    
    await Promise.all([
      SecureStore.setItemAsync(STORE_PASSHASH, passhash),
      SecureStore.setItemAsync(STORE_KEYPAIR, json),
    ])
    
    return keypair
  }
)

export const forgetKeypair = createAsyncThunk<void, void, ThunkApiConfig>(
  'localAccount/forgetKeypair',
  async () => {
    await Promise.all([
      SecureStore.deleteItemAsync(STORE_PASSHASH),
      SecureStore.deleteItemAsync(STORE_KEYPAIR),
      SecureStore.deleteItemAsync(STORE_NONCE),
    ])
  }
)

export const setClientNonce = createAsyncThunk<number, number>(
  'localAccount/setClientNonce',
  async (nonce) => {
    await SecureStore.setItemAsync(STORE_NONCE, nonce.toString())
    return nonce
  }
)

export const incClientNonce = createAsyncThunk<number | undefined, void, ThunkApiConfig>(
  'localAccount/incClientNonce',
  async (args, { getState }) => {
    const currentNonce = getState().localAccount.nonce
    if (!currentNonce) return -1
    
    const nextNonce = currentNonce + 1
    await SecureStore.setItemAsync(STORE_NONCE, nextNonce.toString())
    return nextNonce
  }
)

export const selectKeypair = (state: RootState) => state.localAccount.keypair

const initialState: LocalAccountState = {}

const localAccountSlice = createSlice({
  name: 'localAccount',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    return builder
      .addCase(loadKeypair.fulfilled, (state, action) => {
        state.keypair = action.payload
      })
      .addCase(importKeypair.fulfilled, (state, action) => {
        state.keypair = action.payload
      })
      .addCase(storeKeypair.fulfilled, (state, action) => {
        state.keypair = action.payload
      })
      .addCase(forgetKeypair.fulfilled, (state) => {
        delete state.keypair
        delete state.nonce
      })
      .addCase(setClientNonce.fulfilled, (state, action) => {
        state.nonce = action.payload
      })
      .addCase(incClientNonce.fulfilled, (state, action) => {
        state.nonce = action.payload
      })
  },
})

export default localAccountSlice.reducer

function equalAddresses(addr1: Opt<AccountId>, addr2: Opt<AccountId>): boolean {
  if (!addr1 || !addr2) return false;
  if (addr1 === addr2) return true;
  return asAccountId(addr1)?.eq(asAccountId(addr2)) ?? false;
}

const digestPassphrase = (passphrase: string) => createHash('sha256').update(passphrase).digest('hex')
