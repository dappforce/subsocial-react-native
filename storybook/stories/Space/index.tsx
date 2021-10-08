//////////////////////////////////////////////////////////////////////
// Subsocial Space Component
// SPDX-License-Identifier: GPL-3.0
import React from 'react'
import { SubsocialSubstrateApi } from '@subsocial/api';
import { SpaceId } from '@subsocial/types/substrate/interfaces'
import { AnySpaceId, SpaceData } from '@subsocial/types'
import { useSubsocialInitializer } from '~comps/SubsocialContext'
import { BN } from '@polkadot/util'
import assert from 'assert'

type SpaceStateJob = 'PENDING' | 'LOADING' | 'READY' | 'ERROR'

export class SpaceNotFoundError extends Error {
  constructor(query: SpaceId | number | string) {
    super(`Subsocial Space ${query} not found`);
  }
}

export type SpaceSummaryProps = {
  id?: AnySpaceId
  handle?: string
}

export type SpaceSummaryState = {
  job: SpaceStateJob
}

export function SpaceSummary({id, handle}: SpaceSummaryProps) {
  const [state, data] = useSubsocialInitializer<SpaceData>(async api => {
    const _id  = await _getSpaceId(api.substrate, id, handle);
    const data = await api.findSpace({id: _id});
    if (!data) throw new SpaceNotFoundError(_id.toNumber());
    return data;
  }, [id]);
  
  console.log('data is', data);
  
  return null;
}

async function _getSpaceId(substrate: SubsocialSubstrateApi, id: undefined | AnySpaceId, handle: undefined | string): Promise<BN> {
  if (!id && !handle) throw new Error(`must provide either Subsocial Space ID or Subsocial Space Handle`);
  if (id) return new BN(id);
  
  const spaceid = await substrate.getSpaceIdByHandle(handle!);
  if (!spaceid) throw new SpaceNotFoundError(handle!);
  return spaceid;
}
