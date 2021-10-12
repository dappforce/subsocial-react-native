//////////////////////////////////////////////////////////////////////
// Generic social links for use in e.g. spaces & users
import React from 'react'
import { Falsy, GestureResponderEvent, StyleSheet, View } from 'react-native'
import * as Linking from 'expo-linking'
import { Icon } from 'react-native-elements'
import { NamedLink } from '@subsocial/types'
import { Theme, useTheme } from '~comps/Theming'

export type SocialLinkData = {
  url: string
  name?: string
}
export type SocialLinksProps = {
  links: (string|SocialLinkData|NamedLink|Falsy)[]
  onPress?: (event: SocialLinkResponderEvent) => void
}
export default function SocialLinks({links, onPress}: SocialLinksProps) {
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
    if (domain in SocialLink.iconFactory) {
      iconChildren.push(mapping[domain]);
    }
  }
  
  const linkChildren: JSX.Element[] = [];
  for (let domain in mapping) {
    if (!(domain in SocialLink.iconFactory)) {
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
  
  if (domain && domain in SocialLink.iconFactory) {
    return SocialLink.iconFactory[domain]({url, name, onPress: _onPress, theme});
  }
  return <SocialIcon {...{url, name, theme}} onPress={_onPress} name="globe-outline" family="ionicon" size={24} />
  // return <Link url={url} style={styles.link} onPress={_onPress}>{domain}</Link>
}

export type SocialIconLinkProps = SocialLinkData & {
  onPress: (evt: GestureResponderEvent) => void
  theme: Theme
}

export type SocialIconProps = SocialIconLinkProps & {
  name: string
  family: string
  size: number
}
export const SocialIcon = ({name, family, onPress, theme, size}: SocialIconProps) =>
  <Icon name={name} type={family} onPress={onPress} color={theme.colors.socials} size={size} />

export interface SocialIconLinkFactory {
  (props: SocialIconLinkProps): JSX.Element
}  
SocialLink.iconFactory = {
  'github.com':  (props) => <SocialIcon {...props} name="logo-github"     family="ionicon"   size={24} />,
  'medium.com':  (props) => <SocialIcon {...props} name="medium-monogram" family="antdesign" size={24} />,
  't.me':        (props) => <SocialIcon {...props} name="sc-telegram"     family="evilicon"  size={30} />,
  'twitter.com': (props) => <SocialIcon {...props} name="logo-twitter"    family="ionicon"   size={24} />,
  'youtube.com': (props) => <SocialIcon {...props} name="logo-youtube"    family="ionicon"   size={24} />,
} as Record<string, SocialIconLinkFactory>;


function extractDomain(url: string) {
  const matches = url.match(/^.*?:\/\/(.*?)\/|^.*?:\/\/(.*)$|^(.*?)\/|^(.*)$/);
  if (!matches) return undefined;
  const domain = matches[1] ?? matches[2] ?? matches[3] ?? matches[4];
  return domain.split('.').slice(-2).join('.');
}

const styles = StyleSheet.create({
  links: {
    display: 'flex',
    flexDirection: 'row',
    flexWrap: 'wrap',
    width: '100%',
  },
  link: {
    marginHorizontal: 2,
  },
})
