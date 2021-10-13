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

export function useSpace(id: AnySpaceId | string): [SubsocialInitializerState, SpaceData|undefined] {
  return useSubsocialInitializer(async api => {
    const bnid  = await getSpaceId(api.substrate, id);
    const data = await api.findSpace({id: bnid});
    if (!data) throw new SpaceNotFoundError(bnid.toNumber());
    return data;
  }, [id]);
}

export async function getSpaceId(substrate: SubsocialSubstrateApi, id: string | AnySpaceId): Promise<BN> {
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

const isHandle = (id: string | AnySpaceId) => typeof id === 'string' && id.startsWith('@')
