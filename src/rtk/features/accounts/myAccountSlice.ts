import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { newLogger, nonEmptyStr } from '@subsocial/utils'
import { AccountId } from 'src/types/subsocial'
import { Opt } from 'src/types'
import { asAccountId } from '@subsocial/api'

const log = newLogger('MyAccountSlice')

const MY_ADDRESS = 'df.myAddress'
const DID_SIGN_IN = 'df.didSignIn'

function storeDidSignIn () {
  store.set(DID_SIGN_IN, true)
}

export function readMyAddress (): string | undefined {
  const myAddress: string | undefined = store.get(MY_ADDRESS)
  if (nonEmptyStr(myAddress)) {
    storeDidSignIn()
  }
  return myAddress
}

function storeMyAddress (myAddress: string) {
  store.set(MY_ADDRESS, myAddress)
  storeDidSignIn()
}

export const didSignIn = (): boolean => store.get(DID_SIGN_IN)

type MyAddressState = {
  address?: string,
  blocked?: boolean
}

type ClientNonce = {
  nonce?: number
}

type MyAccountState = MyAddressState & ClientNonce

const initialState: MyAccountState = {}

const myAccountSlice = createSlice({
  name: 'myAccount',
  initialState,
  reducers: {
    setMyAddress (state, action: PayloadAction<AccountId>) {
      const address = action.payload

      if (!equalAddresses(state.address, address)) {
        storeMyAddress(address)
        state.address = address
      }

    },
    setClientNonce (state, action: PayloadAction<number>) {
      const nonce = action.payload
      state.nonce = nonce
      log.debug('New blockchain nonce:', nonce)
    },
    incClientNonce (state) {
      const currentNonce = state.nonce
      if (currentNonce) {
        state.nonce = currentNonce + 1
      }

      log.debug(
        'Chain nonce:',
        currentNonce || 'n/a',
        '; New client nonce:',
        state.nonce || 'n/a'
      )

    },
    loadMyAddress (state) {
      const address = readMyAddress()

      if (address) {
        state.address = address
      }
    },
    signOut (state) {
      store.remove(MY_ADDRESS)

      delete state.address
      delete state.blocked
      delete state.nonce
    } 
  }
})

export const {
  setMyAddress,
  setClientNonce,
  incClientNonce,
  loadMyAddress,
  signOut
} = myAccountSlice.actions

export default myAccountSlice.reducer

function equalAddresses(addr1: Opt<AccountId>, addr2: Opt<AccountId>): boolean {
  if (!addr1 || !addr2) return false;
  if (addr1 === addr2) return true;
  return asAccountId(addr1)?.eq(asAccountId(addr2)) ?? false;
}
