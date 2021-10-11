//////////////////////////////////////////////////////////////////////
// Subsocial Space Component
// SPDX-License-Identifier: GPL-3.0
import React, { useState } from 'react'
import { StyleSheet, View } from 'react-native'
import { Button, Card, Menu, Text, useTheme } from 'react-native-paper'
import { SubsocialSubstrateApi } from '@subsocial/api'
import { SpaceId } from '@subsocial/types/substrate/interfaces'
import { AnySpaceId, SpaceData } from '@subsocial/types'
import { SubsocialInitializerState, useSubsocialInitializer } from '~comps/SubsocialContext'
import { BN } from '@polkadot/util'
import { IpfsAvatar } from '~comps/IpfsImage'
import { Icon } from 'react-native-elements'

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
  if (!id && !handle) throw new Error('require one of Space ID or Space Handle');
  
  const [state, data] = useSubsocialInitializer<SpaceData>(async api => {
    const _id  = await _getSpaceId(api.substrate, id, handle);
    const data = await api.findSpace({id: _id});
    if (!data) throw new SpaceNotFoundError(_id.toNumber());
    return data;
  }, [id]);
  
  const _id: string = id?.toString() || handle!;
  return (
    <View style={styles.container}>
      <SpaceHead id={_id} data={data} />
      <SpaceAbout state={state} data={data} />
    </View>
  )
}

export type SpaceHeadProps = {
  id: AnySpaceId | string
  data?: SpaceData
}
export function SpaceHead({id, data}: SpaceHeadProps) {
  const loading = !data;
  console.log(data?.content?.image)
  
  return (
    <Card.Title
      title={data?.content?.name ?? id}
      subtitle={loading ? 'loading...' : `${data?.struct?.posts_count || 0} posts · ${data?.struct?.followers_count || 0} followers`}
      left={props => <IpfsAvatar {...props} cid={data?.content?.image} />}
      right={props => <SpaceHeadActions {...props} />}
    />
  )
}

type SpaceHeadActionsProps = {
  size: number
}
function SpaceHeadActions({size}: SpaceHeadActionsProps) {
  const [showMenu, setShowMenu] = useState(false);
  const theme = useTheme();
  
  return (
    <View style={styles.actions}>
      <Menu
        visible={showMenu}
        onDismiss={() => setShowMenu(false)}
        anchor={<Icon name="more-horizontal" type="feather" color={theme.colors.primary} size={size} onPress={() => setShowMenu(true)} style={styles.action} />}
      >
        <Menu.Item icon="share" title="share" onPress={() => alert('not yet implemented, sorry')} />
      </Menu>
      <Button mode="outlined" style={styles.action} onPress={() => alert('not yet implemented, sorry')}>
        follow
      </Button>
    </View>
  )
}

export type SpaceAboutProps = {
  state: SubsocialInitializerState
  data?: SpaceData
}
export function SpaceAbout({state, data}: SpaceAboutProps) {
  const isLoading = state === 'PENDING' || state === 'LOADING'
  const isError   = state === 'ERROR'
  
  if (isLoading) {
    return <Text style={styles.italic}>loading ...</Text>
  }
  if (isError) {
    return <Text style={styles.italic}>An error occurred while loading Space's About.</Text>
  }
  if (!data?.content?.about) {
    return <Text style={styles.italic}>no about info specified</Text>
  }
  return <Text>{data!.content!.about!}</Text>
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


const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  actions: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
  },
  action: {
    marginHorizontal: 5,
  },
  italic: {
    fontStyle: 'italic',
  }
});
