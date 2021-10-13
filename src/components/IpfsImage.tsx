//////////////////////////////////////////////////////////////////////
// Helper class to access images from Subsocial IPFS
// SPDX-License-Identifier: GPL-3.0
import React, { useEffect, useState } from 'react'
import { Falsy, Image as RNImage, ImageStyle, ImageSourcePropType, StyleProp, View, ViewStyle } from 'react-native'
import { Image as RNEImage, ImageProps } from 'react-native-elements'
import { ActivityIndicator, Avatar } from 'react-native-paper'
import { useTheme } from './Theming'
import config from 'config.json'

type CID = string

export type IpfsImageProps = Omit<ImageProps, 'source'> & {
  cid?: CID
  style?: StyleProp<ImageStyle>
}

export function IpfsImage({cid, PlaceholderContent, ...props}: IpfsImageProps) {
  if (!cid) return null;
  const uri = IpfsImage.getUri(cid);
  return <RNEImage {...props} source={{uri}} PlaceholderContent={PlaceholderContent ?? <ActivityIndicator />} />
}

IpfsImage.getUri = (cid: Falsy|CID) => cid ? `${config.connections.ipfs}/ipfs/${cid}` : undefined

export type IpfsBannerProps = IpfsImageProps & {
  containerStyle?: StyleProp<ViewStyle>
}
export function IpfsBanner({cid, style, containerStyle, ...props}: IpfsBannerProps) {
  if (!cid) return null;
  
  const [contW, setContentWidth] = useState(0);
  const [[realW, realH], setSize] = useState([0, 0]);
  const [width, height] = getScaledSize(contW, realW, realH);
  const uri = IpfsImage.getUri(cid!)!;
  
  useEffect(() => {
    RNImage.getSize(uri, (width, height) => setSize([width, height]));
  }, [cid]);
  
  return (
    <View style={[{width: '100%'}, containerStyle]} onLayout={({nativeEvent}) => setContentWidth(nativeEvent.layout.width)}>
      <IpfsImage {...props} cid={cid} style={[{width, height}, style]} />
    </View>
  );
}

export type IpfsAvatarProps = Omit<React.ComponentProps<typeof Avatar.Image>, 'source'> & {
  cid?: CID
  source?: ImageSourcePropType
  size?: number
  style?: StyleProp<ViewStyle>
  imageStyle?: StyleProp<ImageStyle>
}
/**
 * Marriage of RNP-Avatar.Image x IpfsImage.
 * 
 * When `typeof source === 'number'`, prefers `source`. Otherwise, when `cid` is given, prefers `cid` (IPFS) over
 * `source` (Web2).
 */
export function IpfsAvatar({source, cid, style, ...props}: IpfsAvatarProps) {
  const theme = useTheme();
  const [loaded, setLoaded] = useState(false);
  const onLoad = () => setLoaded(true);
  
  useEffect(() => {
    setLoaded(false);
  }, [cid]);
  
  return (
    <Avatar.Image style={[loaded && {backgroundColor: 'transparent'}, style]}
      {...props}
      source={({size}) =>
        <IpfsImage
          cid={cid}
          onLoad={onLoad}
          style={{width: size, height: size, borderRadius: 100}}
          placeholderStyle={{backgroundColor: theme.colors.primary}}
          PlaceholderContent={<ActivityIndicator color={theme.colors.background} />}
        />}
    />
  )
}

function getScaledSize(wantW: undefined | number, realW: number, realH: number): [number, number] {
  if (!wantW) return [realW, realH];
  if (!realH) return [0, 0];
  return [wantW, wantW * realH/realW];
}
