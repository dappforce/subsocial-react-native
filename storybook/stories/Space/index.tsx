//////////////////////////////////////////////////////////////////////
// Subsocial Space Component
// SPDX-License-Identifier: GPL-3.0
import React, { useState } from 'react'
import { Falsy, GestureResponderEvent, ScrollView, StyleSheet, View } from 'react-native'
import * as Linking from 'expo-linking'
import { Card, Menu, Text } from 'react-native-paper'
import { Icon } from 'react-native-elements'
import { SubsocialSubstrateApi } from '@subsocial/api'
import { SpaceId } from '@subsocial/types/substrate/interfaces'
import { AnySpaceId, NamedLink, SpaceData } from '@subsocial/types'
import { SubsocialInitializerState, useSubsocialInitializer } from '~comps/SubsocialContext'
import { IpfsAvatar } from '~comps/IpfsImage'
import { Button, Chip, Link, Markdown } from '~comps/Typography'
import { Theme, useTheme } from '~comps/Theming'
import { BN } from '@polkadot/util'

export class SpaceNotFoundError extends Error {
  constructor(query: SpaceId | number | string) {
    super(`Subsocial Space ${query} not found`);
  }
}

export type SpaceOverviewProps = {
  id?: AnySpaceId
  handle?: string
}
export function SpaceOverview({id, handle}: SpaceOverviewProps) {
  const [_, data] = useSpace(id, handle);
  return (
    <View style={styles.container}>
      <SpaceSummary {...{id, handle}} />
      <SpaceLinks links={data?.content?.links??[]} />
      <SpaceTags tags={data?.content?.tags??[]} />
    </View>
  )
}

export type SpaceSummaryProps = {
  id?: AnySpaceId
  handle?: string
}
export function SpaceSummary({id, handle}: SpaceSummaryProps) {
  const [state, data] = useSpace(id, handle);
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
  return (
    <Card.Title
      title={data?.content?.name ?? id}
      subtitle={loading ? 'loading...' : `${data?.struct?.posts_count || 0} Posts · ${data?.struct?.followers_count || 0} Followers`}
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
        anchor={<Icon name="more-horizontal" type="feather" color={theme.colors.textSecondary} size={size} onPress={() => setShowMenu(true)} style={styles.action} />}
      >
        <Menu.Item icon="share" title="share" onPress={() => alert('not yet implemented, sorry')} />
      </Menu>
      <Button mode="contained" style={styles.action} onPress={() => alert('not yet implemented, sorry')}>
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
  return <Markdown>{data!.content!.about!}</Markdown>
}

export type SpaceLinkData = {
  url: string
  name?: string
}
export type SpaceLinksProps = {
  links: (string|SpaceLinkData|NamedLink|Falsy)[]
  onPress?: (event: SpaceLinkResponderEvent) => void
}
export function SpaceLinks({links, onPress}: SpaceLinksProps) {
  const defaultHandler = ({link: {url}}: SpaceLinkResponderEvent) => Linking.openURL(url);
  
  links.find(link => typeof link !== 'string') && console.error('no idea how to handle named links', links.filter(link => typeof link !== 'string'));
  const urls = links.filter(link => typeof link === 'string') as unknown as string[];
  
  const mapping: Record<string, JSX.Element> = {};
  for (let url of urls) {
    const domain = extractDomain(url);
    if (!domain) {
      console.error('failed to extract domain from url', url);
      continue;
    }
    mapping[domain] = <SpaceLink url={url} key={url} onPress={onPress??defaultHandler} />
  }
  
  const iconChildren: JSX.Element[] = [];
  for (let domain in mapping) {
    if (domain in SpaceLink.icons) {
      iconChildren.push(mapping[domain]);
    }
  }
  
  const linkChildren: JSX.Element[] = [];
  for (let domain in mapping) {
    if (!(domain in SpaceLink.icons)) {
      linkChildren.push(mapping[domain]);
    }
  }
  
  return (
    <View>
      <View style={styles.links}>{iconChildren}</View>
      <View style={styles.links}>{linkChildren}</View>
    </View>
  )
}

export type SpaceLinkResponderEvent = GestureResponderEvent & {
  link: SpaceLinkData
}
export type SpaceLinkProps = SpaceLinkData & {
  onPress?: (event: SpaceLinkResponderEvent) => void
}
export function SpaceLink({url, name, onPress}: SpaceLinkProps) {
  const theme = useTheme();
  const domain = extractDomain(url)?.toLowerCase?.();
  const _onPress = (evt: GestureResponderEvent) => onPress?.({...evt, link: {url, name}});
  
  if (domain && domain in SpaceLink.icons) {
    return SpaceLink.icons[domain]({url, name, onPress: _onPress, theme});
  }
  return <Link url={url} style={styles.link} onPress={_onPress}>{domain}</Link>
}

export type SpaceIconLinkProps = SpaceLinkData & {
  onPress: (evt: GestureResponderEvent) => void
  theme: Theme
}
export interface SpaceIconLinkFactory {
  (props: SpaceIconLinkProps): JSX.Element
}
SpaceLink.icons = {
  'youtube.com': ({onPress, theme}) => <Icon name="logo-youtube" type="ionicon" onPress={onPress} color={theme.colors.socials} size={24} />,
} as Record<string, SpaceIconLinkFactory>;

export type SpaceTagsProps = {
  tags: string[]
  onPress?: (tag: string) => void
}
export function SpaceTags({tags, onPress}: SpaceTagsProps) {
  if (!tags.length) return null;
  
  const defaultHandler: SpaceTagsProps['onPress'] = () => alert('not yet implemented, sorry')
  
  const children = tags.map(tag => (
    <Chip
      mode="accent"
      onPress={()=>(onPress??defaultHandler)(tag)}
      key={tag}
      style={styles.tag}
    >
      {tag}
    </Chip>
  ));

  return <ScrollView style={styles.tags} horizontal showsHorizontalScrollIndicator={false}>{children}</ScrollView>
}


function useSpace(id?: AnySpaceId, handle?: string): [SubsocialInitializerState, SpaceData|undefined] {
  if (!id && !handle) throw new Error('require one of Space ID or Space Handle');
  return useSubsocialInitializer(async api => {
    const _id  = await _getSpaceId(api.substrate, id, handle);
    const data = await api.findSpace({id: _id});
    if (!data) throw new SpaceNotFoundError(_id.toNumber());
    return data;
  }, [id, handle]);
}

function extractDomain(url: string) {
  const matches = url.match(/^.*?:\/\/(.*?)\/|^.*?:\/\/(.*)$/);
  if (!matches) return undefined;
  const domain = matches[1] ?? matches[2];
  return domain.split('.').slice(-2).join('.');
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
  links: {
    display: 'flex',
    flexDirection: 'row',
    flexWrap: 'wrap',
    width: '100%',
  },
  link: {
    marginHorizontal: 2,
  },
  tags: {
    display: 'flex',
    flexDirection: 'row',
    width: '100%',
    marginTop: 4,
  },
  tag: {
    marginHorizontal: 2,
    marginVertical: 4,
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
