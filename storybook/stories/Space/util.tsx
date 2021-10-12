//////////////////////////////////////////////////////////////////////
// useSpace helper - a specialization of useSubsocialInitializer for
// loading space data
import { SubsocialSubstrateApi } from '@subsocial/api'
import { SpaceId } from '@subsocial/types/substrate/interfaces'
import { SubsocialInitializerState, useSubsocialInitializer } from '~comps/SubsocialContext'
import { AnySpaceId, SpaceData } from '@subsocial/types'
import { BN } from '@polkadot/util'

export class SpaceNotFoundError extends Error {
  constructor(query: SpaceId | number | string) {
    super(`Subsocial Space ${query} not found`);
  }
}

export function useSpace(id?: AnySpaceId, handle?: string): [SubsocialInitializerState, SpaceData|undefined] {
  if (!id && !handle) throw new Error('require one of Space ID or Space Handle');
  return useSubsocialInitializer(async api => {
    const _id  = await _getSpaceId(api.substrate, id, handle);
    const data = await api.findSpace({id: _id});
    if (!data) throw new SpaceNotFoundError(_id.toNumber());
    return data;
  }, [id, handle]);
}

async function _getSpaceId(substrate: SubsocialSubstrateApi, id: undefined | AnySpaceId, handle: undefined | string): Promise<BN> {
  if (!id && !handle) throw new Error(`must provide either Subsocial Space ID or Subsocial Space Handle`);
  
  if (id) {
    return new BN(id);
  }
  else if (handle) {
    if (handle.startsWith('@')) handle = handle.substr(1);
    
    const spaceid = await substrate.getSpaceIdByHandle(handle);
    if (!spaceid) throw new SpaceNotFoundError(handle);
    return spaceid;
  }
  else {
    throw new Error('should not enter');
  }
}

