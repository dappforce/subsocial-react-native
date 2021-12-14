//////////////////////////////////////////////////////////////////////
// Utility functions to make our lives easier when working with Substrate.
import { ISubmittableResult } from '@polkadot/types/types'
import BN from 'bn.js'

export const asBn = (value: any): BN => BN.isBN(value) ? value : new BN(value)

export function getNewIdsFromEvent(result: ISubmittableResult): BN[] {
  // Accumulate IDs from all events in the TX
  return result.events.reduce((r, {event}) => {
    const { data, method } = event
    if (method.includes('Created')) {
      return r.concat(data.toArray().slice(1) as unknown as BN[])
    }
    else {
      return r
    }
  }, [] as BN[])
}

export const getNewIdFromEvent = (result: ISubmittableResult) => getNewIdsFromEvent(result)[0]
