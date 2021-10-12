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

export type OverviewProps = {
  id?: AnySpaceId
  handle?: string
}
export function Overview({id, handle}: OverviewProps) {
  const [_, data] = useSpace(id, handle);
  return (
    <View style={styles.container}>
      <Summary {...{id, handle}} />
      <SocialLinks links={data?.content?.links??[]} />
      <Tags tags={data?.content?.tags??[]} />
    </View>
  )
}

export type SummaryProps = {
  id?: AnySpaceId
  handle?: string
}
export function Summary({id, handle}: SummaryProps) {
  const [state, data] = useSpace(id, handle);
  const _id: string = id?.toString() || handle!;
  return (
    <View style={styles.container}>
      <Head id={_id} data={data} />
      <About state={state} data={data} />
    </View>
  )
}

export type HeadProps = {
  id: AnySpaceId | string
  data?: SpaceData
}
export function Head({id, data}: HeadProps) {
  const loading = !data;
  return (
    <Card.Title
      title={data?.content?.name ?? id}
      subtitle={loading ? 'loading...' : `${data?.struct?.posts_count || 0} Posts · ${data?.struct?.followers_count || 0} Followers`}
      left={props => <IpfsAvatar {...props} cid={data?.content?.image} />}
      right={props => <HeadActions {...props} />}
    />
  )
}

type HeadActionsProps = {
  size: number
}
function HeadActions({size}: HeadActionsProps) {
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

export type AboutProps = {
  state: SubsocialInitializerState
  data?: SpaceData
}
export function About({state, data}: AboutProps) {
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

export type SocialLinkData = {
  url: string
  name?: string
}
export type SocialLinksProps = {
  links: (string|SocialLinkData|NamedLink|Falsy)[]
  onPress?: (event: SocialLinkResponderEvent) => void
}
export function SocialLinks({links, onPress}: SocialLinksProps) {
  const defaultHandler = ({link: {url}}: SocialLinkResponderEvent) => Linking.openURL(url);
  
  links.find(link => typeof link !== 'string') && console.error('no idea how to handle named links', links.filter(link => typeof link !== 'string'));
  const urls = links.filter(link => typeof link === 'string') as unknown as string[];
  
  const mapping: Record<string, JSX.Element> = {};
  for (let url of urls) {
    const domain = extractDomain(url);
    if (!domain) {
      console.error('failed to extract domain from url', url);
      continue;
    }
    mapping[domain] = <SocialLink url={url} key={url} onPress={onPress??defaultHandler} />
  }
  
  const iconChildren: JSX.Element[] = [];
  for (let domain in mapping) {
    if (domain in SocialLink.icons) {
      iconChildren.push(mapping[domain]);
    }
  }
  
  const linkChildren: JSX.Element[] = [];
  for (let domain in mapping) {
    if (!(domain in SocialLink.icons)) {
      linkChildren.push(mapping[domain]);
    }
  }
  
  return (
    <View style={styles.links}>
      {linkChildren}
      {iconChildren}
    </View>
  )
}

export type SocialLinkResponderEvent = GestureResponderEvent & {
  link: SocialLinkData
}
export type SocialLinkProps = SocialLinkData & {
  onPress?: (event: SocialLinkResponderEvent) => void
}
export function SocialLink({url, name, onPress}: SocialLinkProps) {
  const theme = useTheme();
  const domain = extractDomain(url)?.toLowerCase?.();
  const _onPress = (evt: GestureResponderEvent) => onPress?.({...evt, link: {url, name}});
  
  if (domain && domain in SocialLink.icons) {
    return SocialLink.icons[domain]({url, name, onPress: _onPress, theme});
  }
  return <SocialIcon {...{url, name, theme}} onPress={_onPress} name="globe-outline" family="ionicon" size={24} />
  // return <Link url={url} style={styles.link} onPress={_onPress}>{domain}</Link>
}

export type SocialIconLinkProps = SocialLinkData & {
  onPress: (evt: GestureResponderEvent) => void
  theme: Theme
}

type SocialIconProps = SocialIconLinkProps & {
  name: string
  family: string
  size: number
}
const SocialIcon = ({name, family, onPress, theme, size}: SocialIconProps) =>
  <Icon name={name} type={family} onPress={onPress} color={theme.colors.socials} size={size} />

export interface SocialIconLinkFactory {
  (props: SocialIconLinkProps): JSX.Element
}  
SocialLink.icons = {
  'github.com':  (props) => <SocialIcon {...props} name="logo-github"     family="ionicon"   size={24} />,
  'medium.com':  (props) => <SocialIcon {...props} name="medium-monogram" family="antdesign" size={24} />,
  't.me':        (props) => <SocialIcon {...props} name="sc-telegram"     family="evilicon"  size={30} />,
  'twitter.com': (props) => <SocialIcon {...props} name="logo-twitter"    family="ionicon"   size={24} />,
  'youtube.com': (props) => <SocialIcon {...props} name="logo-youtube"    family="ionicon"   size={24} />,
} as Record<string, SocialIconLinkFactory>;

export type TagsProps = {
  tags: string[]
  onPress?: (tag: string) => void
}
export function Tags({tags, onPress}: TagsProps) {
  if (!tags.length) return null;
  
  const defaultHandler: TagsProps['onPress'] = () => alert('not yet implemented, sorry')
  
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
