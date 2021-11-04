//////////////////////////////////////////////////////////////////////
// Helper class to access images from Subsocial IPFS
// SPDX-License-Identifier: GPL-3.0
import React, { useEffect, useState } from 'react'
import { Falsy, GestureResponderEvent, Image as RNImage, ImageSourcePropType, StyleProp, TouchableWithoutFeedback, View, ViewStyle } from 'react-native'
import FastImage, { FastImageProps, ImageStyle } from 'react-native-fast-image'
import { Avatar } from 'react-native-paper'
import config from 'config.json'

type CID = string

export type IpfsImageProps = Omit<FastImageProps, 'source'> & {
  cid?: CID
  style?: StyleProp<ImageStyle>
}

export function IpfsImage({ cid, ...props }: IpfsImageProps) {
  if (!cid) return null
  
  const uri = IpfsImage.getUri(cid)
  return <FastImage
    {...props}
    source={{ uri }}
  />
}

IpfsImage.getUri = (cid: Falsy|CID) => cid ? `${config.connections.ipfs}/ipfs/${cid}` : undefined

export type IpfsBannerProps = IpfsImageProps & {
  containerStyle?: StyleProp<ViewStyle>
}
export function IpfsBanner({ cid, style, containerStyle, ...props }: IpfsBannerProps) {
  if (!cid) return null
  
  const [contW, setContentWidth] = useState(0)
  const [[realW, realH], setSize] = useState([0, 0])
  const [width, height] = getScaledSize(contW, realW, realH)
  const uri = IpfsImage.getUri(cid!)!
  
  useEffect(() => {
    RNImage.getSize(uri, (width, height) => setSize([width, height]))
  }, [ cid ])
  
  return (
    <View
      style={[{width: '100%'}, containerStyle]}
      onLayout={({ nativeEvent }) => setContentWidth(nativeEvent.layout.width)}
    >
      <IpfsImage {...props} cid={cid} style={[{width, height}, style]} />
    </View>
  )
}

export type IpfsAvatarProps = Omit<React.ComponentProps<typeof Avatar.Image>, 'source'> & {
  cid?: CID
  source?: ImageSourcePropType
  size?: number
  style?: StyleProp<ViewStyle>
  imageStyle?: StyleProp<ImageStyle>
  onPress?: (evt: GestureResponderEvent) => void
}
/**
 * Marriage of RNP-Avatar.Image x IpfsImage.
 * 
 * When `typeof source === 'number'`, prefers `source`. Otherwise, when `cid` is given, prefers `cid` (IPFS) over
 * `source` (Web2).
 */
export function IpfsAvatar({ source, cid, style, onPress, ...props }: IpfsAvatarProps) {
  const [loaded, setLoaded] = useState(false)
  const onLoad = () => setLoaded(true)
  
  useEffect(() => {
    setLoaded(false)
  }, [ cid ])
  
  const avatar = (
    <Avatar.Image style={[loaded && {backgroundColor: 'transparent'}, style]}
      {...props}
      source={({ size }) =>
        <IpfsImage
          cid={cid}
          onLoad={onLoad}
          style={{width: size, height: size, borderRadius: 100}}
        />
      }
    />
  )
  
  if (onPress) {
    return <TouchableWithoutFeedback onPress={onPress}>{avatar}</TouchableWithoutFeedback>
  }
  
  else {
    return avatar
  }
}

function getScaledSize(wantW: undefined | number, realW: number, realH: number): [number, number] {
  if (!wantW) return [realW, realH]
  
  if (!realH) return [0, 0]
  
  return [wantW, wantW * realH/realW]
}
