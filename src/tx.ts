//////////////////////////////////////////////////////////////////////
// Mini wrapper library for Substrate tx's
import { ApiPromise } from '@polkadot/api'
import { SubmittableExtrinsic } from '@polkadot/api/types'
import { Hash } from '@polkadot/types/interfaces'
import { ISubmittableResult } from '@polkadot/types/types'
import { incClientNonce, selectKeypair } from './rtk/features/accounts/localAccountSlice'
import store from './rtk/app/store'

export type Extrinsic = SubmittableExtrinsic<'promise', ISubmittableResult>

export class UnknownExtrinsicError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'UnknownExtrinsicError'
  }
}

export class NoKeypairError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'NoKeypairError'
  }
}

export type SendArgs = {
  api: ApiPromise
  tx: string
  unsigned?: boolean
  args?: any[] | (() => any[] | Promise<any[]>)
}
export async function send({
  api,
  tx,
  unsigned,
  args = [],
}: SendArgs): Promise<Hash>
{
  const [ pallet, method ] = tx.split('.', 2)
  const realArgs = typeof args === 'function' ? await args() : args
  
  const extrinsic = api.tx[pallet]?.[method]?.(...realArgs)
  if (!extrinsic)
    throw new Error(`Unknown ${pallet}/${method} extrinsic`)
  
  if (unsigned) {
    return extrinsic.send()
  }
  
  else {
    const keypair = selectKeypair(store.getState())
    if (!keypair)
      throw new Error('No keypair loaded')
    
    // if unloaded automatically returns -1 = auto-fetch from node
    const nonce = await store.dispatch(incClientNonce()).unwrap()
    
    return extrinsic.signAndSend(keypair, { nonce })
  }
}
