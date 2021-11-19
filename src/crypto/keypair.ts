//////////////////////////////////////////////////////////////////////
// Simplified keypair solution to make compatible with Polkadot TX
// Inspired by https://github.com/polkadot-js/common/blob/3b2ecb87e9cdd337bfda1469a410fc3613123c14/packages/keyring/src/pair/index.ts
// -----
// NOTE: Because we use native secure storage which already encrypts data, we don't need to enscrypt the keypair. Though it wouldn't hurt.
import { createHash } from 'crypto'
import { IKeyringPair } from '@polkadot/types/types'
import { hexToU8a, isHex, stringToU8a, u8aConcat, u8aToString, u8aToU8a } from '@polkadot/util'
import {
  decodeAddress,
  encodeAddress,
  keyExtractSuri,
  keyFromPath,
  mnemonicToMiniSecret,
  naclKeypairFromSeed,
  naclSign,
  randomAsU8a,
  schnorrkelKeypairFromSeed,
  schnorrkelSign,
  signatureVerify,
} from '@polkadot/util-crypto'
import * as SecureStore from 'expo-secure-store'
import { Falsy } from 'react-native'
import { assert } from 'src/util'

// Official Polkadot dev phrase & seed - DO NOT USE IN PRODUCTION, THESE ARE WELL KNOWN
const DEV_PHRASE = 'bottom drive obey lake curtain smoke basket hold race lonely fit walk'
const DEV_SEED   = '0xfac7959dbfe72f052e5a0c3c8d6530f202b02fd8f9f5ca3580ec8deb7797479e'

const STORE_SECRET   = 'df.secretKey'
const STORE_ADDRESS  = 'df.secretKey'
const STORE_TYPE     = 'df.keypairType'
const STORE_SS58     = 'df.keypairSS58Format'
const STORE_PASSHASH = 'df.keypairPasshash'


export class NoKeypairError extends Error {
  constructor(msg: string = 'No keypair') {
    super(msg)
    this.name = 'NoKeypairError'
  }
}


export type IKeypair = IKeyringPair

export type Keypair = ReturnType<typeof keypair>

const keypairTypes = ['ed25519', 'sr25519'] as const
export type KeypairType = typeof keypairTypes[number]

export type ActualKeypair = {
  publicKey: Uint8Array
  secretKey: Uint8Array
}

export type PartialKeypairWithRequiredSecret = Omit<Partial<ActualKeypair>, 'secretKey'> & Pick<ActualKeypair, 'secretKey'>

export type KeypairSetup = {
  type: KeypairType
  ss58Format: number
}


type KeyImpl = {
  prefix: Uint8Array
  fromSeed: (seed: Uint8Array) => ActualKeypair
  sign: (message: Uint8Array, keypair: PartialKeypairWithRequiredSecret) => Uint8Array
}

const keyImpls: Record<KeypairType, KeyImpl> = {
  ed25519: {
    prefix: new Uint8Array([0]),
    fromSeed: naclKeypairFromSeed,
    sign: naclSign,
  },
  
  sr25519: {
    prefix: new Uint8Array([1]),
    fromSeed: schnorrkelKeypairFromSeed,
    sign: schnorrkelSign,
  },
}

export type SignOptions = {
  withType?: boolean
}


export function keypair({ publicKey, secretKey = new Uint8Array() }: ActualKeypair, { type, ss58Format }: KeypairSetup) {
  secretKey = u8aToU8a(secretKey) // ensure local secretKey is independent instance to prevent manipulation from outside post-creation
  
  const isLocked = () => !secretKey.length
  
  const isStored = async () => await SecureStore.getItemAsync(STORE_ADDRESS) === encodeAddress(publicKey, ss58Format)
  
  return {
    address: encodeAddress(publicKey, ss58Format),
    addressRaw: publicKey,
    publicKey,
    
    isLocked,
    isStored,
    
    lock: async () => {
      assert(!isLocked(), 'Keypair is already locked')
      assert(await isStored(), 'Keypair must be stored first')
      secretKey = new Uint8Array()
    },
    
    unlock: async (passphrase?: string | Falsy) => {
      assert(await isStored(), 'Keypair must be stored first')
      await assertPassphrase(passphrase)
      
      const restored = await SecureStore.getItemAsync(STORE_SECRET)
      if (!restored) throw new Error('Failed to restore secret key')
      
      secretKey = stringToU8a(restored)
    },
    
    sign: (msg: Uint8Array, { withType = false }: SignOptions = {}) => {
      assert(!isLocked(), 'Cannot sign with locked keypair')
      
      return u8aConcat(
        withType ? keyImpls[type].prefix : new Uint8Array(),
        keyImpls[type].sign(u8aToU8a(msg), { publicKey, secretKey })
      )
    },
    
    verify: (msg: Uint8Array, sig: Uint8Array, signerPublic: Uint8Array) => {
      return signatureVerify(msg, sig, signerPublic).isValid
    },
    
    /** Store the keypair in Expo-Secure-Store */
    store: async (passphrase?: string) => {
      assert(!isLocked(), 'Cannot store locked keypair')
      
      const passhash = passphrase ? digestPassphrase(passphrase) : ''
      
      await Promise.all([
        SecureStore.setItemAsync(STORE_SECRET, u8aToString(secretKey)),
        SecureStore.setItemAsync(STORE_ADDRESS, encodeAddress(publicKey, ss58Format)),
        SecureStore.setItemAsync(STORE_TYPE, type),
        SecureStore.setItemAsync(STORE_SS58, ss58Format.toString()),
        SecureStore.setItemAsync(STORE_PASSHASH, passhash),
      ])
    },
  }
}

/** Generate random keypair for **testing** purposes. */
export function generateRandomKeypair({ seedSize = 32, ...setup }: Partial<KeypairSetup & {seedSize: number}> = {}) {
  const seed = randomAsU8a(seedSize)
  return fromSeed(seed, setup)
}

export function fromSuri(_suri: string, { type = 'sr25519', ss58Format = 42 }: Partial<KeypairSetup> = {}) {
  const suri = _suri.startsWith('//')
    ? `${DEV_PHRASE}${_suri}`
    : _suri
  
  const { path, phrase, password } = keyExtractSuri(suri)
  let seed: Uint8Array
  
  if (isHex(phrase)) {
    seed = hexToU8a(phrase)
  }
  else {
    const words = phrase.split(' ')
    
    if ([ 12, 15, 18, 21, 24 ].includes(words.length)) {
      seed = mnemonicToMiniSecret(phrase, password)
    }
    else {
      assert(phrase.length <= 32, 'seed phrase too long (> 32 bytes)')
      seed = stringToU8a(phrase)
    }
  }
  
  const derived = keyFromPath(keyImpls[type].fromSeed(seed), path, type)
  return {
    keypair: keypair(derived, { type, ss58Format }),
    password,
  }
}

export function fromSeed(seed: Uint8Array, { type = 'sr25519', ss58Format = 42 }: Partial<KeypairSetup> = {}) {
  const pair = keyImpls[type].fromSeed(seed)
  return keypair(pair, { type, ss58Format })
}


/** Restore previously stored keypair from Expo-Secure-Store */
export async function restore(passphrase: string | Falsy = ''): Promise<Keypair> {
  await assertPassphrase(passphrase)
  
  const [ secret, address, type, ss58Format ] = await Promise.all([
    SecureStore.getItemAsync(STORE_SECRET),
    SecureStore.getItemAsync(STORE_ADDRESS),
    SecureStore.getItemAsync(STORE_TYPE),
    SecureStore.getItemAsync(STORE_SS58).then(ss58 => parseInt(ss58 ?? 'n/a')),
  ])
  
  if (!secret || !address || !type || !ss58Format) throw new NoKeypairError('No keypair stored or stored keypair data damaged')
  
  const secretKey = stringToU8a(secret)
  const publicKey = decodeAddress(address, false, ss58Format)
  
  return keypair({ secretKey, publicKey }, { type: type as KeypairType, ss58Format })
}

/** Forget previously stored keypair, removing it from Expo-Secure-Store */
export async function forget(): Promise<void> {
  await Promise.all([
    SecureStore.deleteItemAsync(STORE_SECRET),
    SecureStore.deleteItemAsync(STORE_ADDRESS),
    SecureStore.deleteItemAsync(STORE_TYPE),
    SecureStore.deleteItemAsync(STORE_SS58),
    SecureStore.deleteItemAsync(STORE_PASSHASH),
  ])
}

export const digestPassphrase = (passphrase: string) => createHash('sha256').update(passphrase).digest().toString('hex')

async function assertPassphrase(passphrase?: string | Falsy) {
  const refhash = await SecureStore.getItemAsync(STORE_PASSHASH)
  assert(!refhash || !!passphrase, 'Cannot restore keypair without passphrase')
  
  if (refhash && passphrase) {
    const passhash = digestPassphrase(passphrase)
    assert(refhash === passhash, 'Invalid passphrase')
  }
}
