import { SubsocialApi, SubsocialSubstrateApi } from '@subsocial/api'
import { SubsocialInitializerState, useSubsocialEffect } from '~comps/SubsocialContext'
import { AnySpaceId, SpaceData } from '@subsocial/types'
import { Visibility } from '@subsocial/api/filters'
import { partition } from '~src/util'
import { BN } from '@polkadot/util'
import { cacheSpaces, querySpaceCache } from '~src/IpfsCache'

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
  return useSubsocialEffect(async api => {
    if (!id) return undefined;
    const [data] = await loadSpaces(api, [id]);
    if (!data) throw new SpaceNotFoundError(id);
    return data;
  }, [id]);
}

export type LoadSpacesOptions = {
  visibility?: Visibility
}
export async function loadSpaces(api: SubsocialApi, ids: UnifiedSpaceId[], {visibility = 'onlyPublic'}: LoadSpacesOptions = {}): Promise<SpaceData[]> {
  const resolved = await resolveSpaceIds(api.substrate, ids); // returns immediately if already resolved
  const structs  = await api.substrate.findSpaces({ids: resolved, visibility});
  const [withCid, withoutCid] = partition(structs, struct => struct.content.isIpfs);
  if (withoutCid.length) {
    console.warn('some spaces have non-IPFS CIDs:', withoutCid);
  }
  
  const cached = await querySpaceCache(withCid.map(struct => struct.content.asIpfs.toString()));
  
  // fetch uncached contents & cache them - if possible
  const missing = withCid.filter(struct => !(struct.content.asIpfs.toString() in cached));
  const fetched = await api.ipfs.findSpaces(missing.map(struct => struct.content.asIpfs.toString()));
  cacheSpaces(fetched);
  
  return withCid.map(struct => {
    const cid = struct.content.asIpfs.toString();
    return {
      struct,
      content: cached[cid] ?? fetched[cid],
    };
  });
}

export async function resolveSpaceId(substrate: SubsocialSubstrateApi, id: UnifiedSpaceId): Promise<BN> {
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
export function resolveSpaceIds(substrate: SubsocialSubstrateApi, ids: UnifiedSpaceId[]): Promise<BN[]> {
  return Promise.all(ids.map(id => resolveSpaceId(substrate, id)));
}

const isHandle = (id: UnifiedSpaceId) => typeof id === 'string' && id.startsWith('@')
