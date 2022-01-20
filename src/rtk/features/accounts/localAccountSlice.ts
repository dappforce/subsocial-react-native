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
import * as SecureStore from 'expo-secure-store'
import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import { newLogger } from '@subsocial/utils'
import { AccountId } from 'src/types/subsocial'
import { Opt } from 'src/types'
import { forget as _forgetKeypair, hasStoredKeypair, Keypair, restore as restoreKeypair } from 'src/crypto/keypair'
import { asAccountId } from '@subsocial/api'
import { RootState } from 'src/rtk/app/rootReducer'

const log = newLogger('LocalAccountSlice')

const STORE_NONCE = 'df.nonce'

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

// do not store secret in memory for security probably
// ask slice to sign instead
type LocalAccountState = {
  keypair?: Keypair
  nonce?: number
  stored?: boolean
  locked?: boolean
}

export const checkForStoredKeypair = createAsyncThunk<boolean, void, ThunkApiConfig>(
  'localAccount/checkForStored',
  async () => {
    return await hasStoredKeypair()
  }
)

export const loadKeypair = createAsyncThunk<Keypair, void, ThunkApiConfig>(
  'localAccount/loadKeypair',
  async (_, { getState }) => {
    let keypair = getState().localAccount.keypair
    
    if (!keypair) keypair = await restoreKeypair()
    
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
    await keypair.store(passphrase)
    return keypair
  }
)

export const lockKeypair = createAsyncThunk<void, void, Omit<ThunkApiConfig, 'rejectValue'> & { rejectValue: NoKeypairError }>(
  'localAccount/lock',
  async (_, { getState, rejectWithValue }) => {
    const keypair = getState().localAccount.keypair
    if (!keypair) return rejectWithValue(new NoKeypairError())
    
    if (keypair.isLocked()) await keypair.lock()
  }
)

export const unlockKeypair = createAsyncThunk<void, string | undefined, Omit<ThunkApiConfig, 'rejectValue'> & { rejectValue: NoKeypairError }>(
  'localAccount/unlock',
  async (passphrase, { getState, rejectWithValue }) => {
    const keypair = getState().localAccount.keypair
    if (!keypair) return rejectWithValue(new NoKeypairError())
    
    if (keypair.isLocked()) await keypair.unlock(passphrase)
  }
)

export const forgetKeypair = createAsyncThunk<void, void, ThunkApiConfig>(
  'localAccount/forgetKeypair',
  async () => {
    await _forgetKeypair()
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

export const selectHasStoredKeypair = (state: RootState) => state.localAccount.stored

const initialState: LocalAccountState = {}

const localAccountSlice = createSlice({
  name: 'localAccount',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    return builder
      .addCase(checkForStoredKeypair.fulfilled, (state, action) => {
        state.stored = action.payload
      })
      .addCase(loadKeypair.fulfilled, (state, action) => {
        state.keypair = action.payload
        state.stored = true
        state.locked = action.payload.isLocked()
      })
      .addCase(storeKeypair.fulfilled, (state, action) => {
        state.keypair = action.payload
        state.stored = true
        state.locked = action.payload.isLocked()
      })
      .addCase(lockKeypair.fulfilled, (state) => {
        state.locked = true
      })
      .addCase(unlockKeypair.fulfilled, (state) => {
        state.locked = false
      })
      .addCase(forgetKeypair.fulfilled, (state) => {
        delete state.keypair
        delete state.nonce
        delete state.locked
        state.stored = false
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
