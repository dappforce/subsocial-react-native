//////////////////////////////////////////////////////////////////////
// useSpace helper - a specialization of useSubsocialInitializer for
// loading space data
import { SubsocialSubstrateApi } from '@subsocial/api'
import { SubsocialInitializerState, useSubsocialInitializer } from '~comps/SubsocialContext'
import { AnySpaceId, SpaceData } from '@subsocial/types'
import { BN } from '@polkadot/util'

/**
 * Unified space ID, from numbers, BNs, number strings & handles.
 */
export type UnifiedSpaceId = string | number | AnySpaceId

export class SpaceNotFoundError extends Error {
  constructor(query: UnifiedSpaceId) {
    super(`Subsocial Space ${query} not found`);
  }
}

export function useSpace(id: UnifiedSpaceId): [SubsocialInitializerState, SpaceData|undefined] {
  return useSubsocialInitializer(async api => {
    if (!id) return undefined;
    const bnid  = await getSpaceId(api.substrate, id);
    const data = await api.findSpace({id: bnid});
    if (!data) throw new SpaceNotFoundError(bnid.toNumber());
    return data;
  }, [id]);
}

export async function getSpaceId(substrate: SubsocialSubstrateApi, id: UnifiedSpaceId): Promise<BN> {
  if (isHandle(id)) {
    const handle = (id as string).substr(1).toLowerCase();
    const spaceid = await substrate.getSpaceIdByHandle(handle);
    if (!spaceid) throw new SpaceNotFoundError(handle);
    return spaceid;
  }
  else {
    return new BN(id);
  }
}

const isHandle = (id: UnifiedSpaceId) => typeof id === 'string' && id.startsWith('@')
