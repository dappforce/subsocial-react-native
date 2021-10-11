//////////////////////////////////////////////////////////////////////
// Helper class to access images from Subsocial IPFS
// SPDX-License-Identifier: GPL-3.0
import React, { useEffect, useState } from 'react'
import { Falsy, Image, ImageProps, ImageStyle, ImageSourcePropType, StyleProp, View, ViewStyle } from 'react-native'
import { Avatar, DefaultTheme } from 'react-native-paper'
import config from 'config.json'

export type IpfsImageProps = Omit<ImageProps, 'source'> & {
  cid?: string
  style?: StyleProp<ImageStyle>
}

export function IpfsImage({cid, ...props}: IpfsImageProps) {
  if (!cid) return null;
  const uri = IpfsImage.getUri(cid);
  return <Image {...props} source={{uri}} />
}

IpfsImage.getUri = (cid: Falsy|string) => cid ? `${config.connections.ipfs}/ipfs/${cid}` : undefined

export type IpfsBannerProps = IpfsImageProps & {
  
}

export function IpfsBanner({cid, style}: IpfsBannerProps) {
  if (!cid) return null;
  
  const [contW, setContentWidth] = useState(0);
  const [[realW, realH], setSize] = useState([0, 0]);
  const [width, height] = getScaledSize(contW, realW, realH);
  const uri = IpfsImage.getUri(cid!)!;
  
  useEffect(() => {
    Image.getSize(uri, (width, height) => setSize([width, height]));
  }, []);
  
  return (
    <View style={{width: '100%', ...(style as Object)}} onLayout={({nativeEvent}) => setContentWidth(nativeEvent.layout.width)}>
      <IpfsImage cid={cid} style={{...(style as Object), width, height}} />
    </View>
  );
}

export type IpfsAvatarProps = IpfsImageProps & {
  source?: ImageSourcePropType
  size?: number
  style?: StyleProp<ViewStyle>
  theme?: typeof DefaultTheme
}

/**
 * Marriage of RNP-Avatar.Image x IpfsImage.
 * 
 * When `typeof source === 'number'`, prefers `source`. Otherwise, when `cid` is given, prefers `cid` (IPFS) over
 * `source` (Web2).
 */
export function IpfsAvatar({source, cid, ...props}: IpfsAvatarProps) {
  return (
    <Avatar.Image
      {...props}
      source={({size}) => <IpfsImage {...props} cid={cid} style={{width: size, height: size, borderRadius: 100}} />}
    />
  )
}

function getScaledSize(wantW: undefined | number, realW: number, realH: number): [number, number] {
  if (!wantW) return [realW, realH];
  if (!realH) return [0, 0];
  return [wantW, wantW * realH/realW];
}
