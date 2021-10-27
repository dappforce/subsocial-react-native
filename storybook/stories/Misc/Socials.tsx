//////////////////////////////////////////////////////////////////////
// Generic social links for use in e.g. spaces & users
import React from 'react'
import { Falsy, GestureResponderEvent, StyleSheet, View } from 'react-native'
import * as Linking from 'expo-linking'
import { Icon } from 'react-native-elements'
import { NamedLink } from '@subsocial/types'
import { useTheme } from '~comps/Theming'
import { IconFamily, partition } from 'src/util'

type LinkRecord = {
  url: string
  hasIcon: boolean
  component: React.ReactNode
}

export type SocialLinkData = {
  url: string
  name?: string
}
export type SocialLinksProps = {
  links: (string|SocialLinkData|NamedLink|Falsy)[]
  onPress?: (event: SocialLinkResponderEvent) => void
  color?: string // color of social icons - defaults to theme
  rtl?: boolean // right to left
}
export function SocialLinks({links, onPress, color, rtl = false}: SocialLinksProps) {
  const theme = useTheme();
  const defaultHandler = ({link: {url}}: SocialLinkResponderEvent) => Linking.openURL(url);
  
  links.find(link => typeof link !== 'string') && console.error('no idea how to handle named links', links.filter(link => typeof link !== 'string'));
  const urls = links.filter(link => typeof link === 'string') as unknown as string[];
  
  const children: LinkRecord[] = [];
  for (let url of urls) {
    const domain = extractDomain(url);
    if (!domain) {
      console.error('failed to extract domain from url', url);
      continue;
    }
    children.push({
      url,
      hasIcon: domain in SocialLink.icons,
      component: <SocialLink link={{url}} key={url} onPress={onPress??defaultHandler} color={color||theme.colors.socials} rtl={rtl} />
    })
  }
  
  const [iconChildren, linkChildren] = partition(children, ({hasIcon}) => hasIcon);
  return (
    <View style={[styles.links, rtl && {flexDirection: 'row-reverse'}]}>
      {linkChildren.map(rec => rec.component)}
      {iconChildren.map(rec => rec.component)}
    </View>
  )
}

export type SocialLinkResponderEvent = GestureResponderEvent & {
  link: SocialLinkData
}
export type SocialLinkProps = {
  link: SocialLinkData
  onPress?: (event: SocialLinkResponderEvent) => void
  color: string
  rtl?: boolean
}
export function SocialLink({link, onPress, color, rtl = false}: SocialLinkProps) {
  const domain = extractDomain(link.url)?.toLowerCase?.();
  const _onPress = (evt: GestureResponderEvent) => onPress?.({...evt, link});
  
  const defaultIcon = {name: 'globe-outline', family: 'ionicon', size: 24};
  const {name, family, size} = (domain && SocialLink.icons[domain]) || defaultIcon;
  return <Icon {...{name, type: family, size, color}} onPress={_onPress} style={rtl ? {marginLeft: 10} : {marginRight: 10}} />
}

export type SocialIcon = {
  name: string
  family: IconFamily
  size: number
};
SocialLink.icons = {
  'discord.gg':     {name: "discord",         family: "font-awesome-5", size: 24},
  'discordapp.com': {name: "discord",         family: "font-awesome-5", size: 24},
  'facebook.com':   {name: "logo-facebook",   family: "ionicon",        size: 24},
  'github.com':     {name: "logo-github",     family: "ionicon",        size: 24},
  'instagram.com':  {name: "logo-instagram",  family: "ionicon",        size: 24},
  'linkedin.com':   {name: "logo-linkedin",   family: "ionicon",        size: 24},
  'linked.in':      {name: "logo-linkedin",   family: "ionicon",        size: 24},
  'medium.com':     {name: "medium-monogram", family: "antdesign",      size: 24},
  't.me':           {name: "sc-telegram",     family: "evilicon",       size: 32},
  'twitter.com':    {name: "logo-twitter",    family: "ionicon",        size: 24},
  'youtube.com':    {name: "logo-youtube",    family: "ionicon",        size: 24},
} as Record<string, SocialIcon>;


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
    marginVertical: 8,
  },
})
