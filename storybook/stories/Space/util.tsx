import { SubsocialSubstrateApi } from '@subsocial/api'
import { SpaceId } from 'src/types/subsocial'

export class SpaceNotFoundError extends Error {
  constructor(query: SpaceId) {
    super(`Subsocial Space ${query} not found`);
  }
}

export async function resolveSpaceId(substrate: SubsocialSubstrateApi, id: SpaceId): Promise<SpaceId> {
  if (isHandle(id)) {
    const handle = (id as string).substr(1).toLowerCase();
    const spaceid = await substrate.getSpaceIdByHandle(handle);
    if (!spaceid) throw new SpaceNotFoundError(handle);
    return spaceid+''
  }
  else {
    return id
  }
}
export function resolveSpaceIds(substrate: SubsocialSubstrateApi, ids: SpaceId[]): Promise<SpaceId[]> {
  return Promise.all(ids.map(id => resolveSpaceId(substrate, id)))
}

const isHandle = (id: SpaceId) => typeof id === 'string' && id.startsWith('@')
