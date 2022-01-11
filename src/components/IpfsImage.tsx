//////////////////////////////////////////////////////////////////////
// Helper class to access images from Subsocial IPFS
// SPDX-License-Identifier: GPL-3.0
import React, { useEffect, useState } from 'react'
import { GestureResponderEvent, Image as RNImage, ImageSourcePropType, StyleProp, TouchableWithoutFeedback, View, ViewStyle } from 'react-native'
import FastImage, { FastImageProps, ImageStyle } from 'react-native-fast-image'
import { Avatar } from 'react-native-paper'
import { useSubsocial } from './SubsocialContext'
import { useTheme } from './Theming'
import { useSelectKeypair, useSelectProfile } from 'src/rtk/app/hooks'
import { useAppDispatch } from 'src/rtk/app/hooksCommon'
import { useDeferred, useInit } from './hooks'
import { fetchProfile } from 'src/rtk/features/profiles/profilesSlice'
import { Icon } from './Icon'
import * as IpfsCache from '../IpfsCache'
import { timed } from 'uniprofiler/react'

export type IpfsImageProps = Omit<FastImageProps, 'source'> & {
  cid?: IpfsCache.CID
  style?: StyleProp<ImageStyle>
}

export const IpfsImage = timed<IpfsImageProps>('IpfsImage', ({ cid, profile, ...props }) => {
  const uri = useDeferred(async () => {
    if (!cid) return undefined
    
    const caches = await profile!.timed('queryImage', () => IpfsCache.queryImage([cid]))
    return caches[cid]
  }, [ cid ])
  
  if (!uri) return null
  
  return <FastImage
    {...props}
    source={{ uri: uri.toString() }}
  />
}).memoize();

export type IpfsBannerProps = IpfsImageProps & {
  containerStyle?: StyleProp<ViewStyle>
}
export const IpfsBanner = React.memo(({ cid, style, containerStyle, ...props }: IpfsBannerProps) => {
  const [contW, setContentWidth] = useState(0)
  const [[realW, realH], setSize] = useState([0, 0])
  const [width, height] = getScaledSize(contW, realW, realH)
  const uri = useDeferred(async () => {
    if (!cid) return undefined
    const caches = await IpfsCache.queryImage([cid])
    return caches[cid]
  }, [ cid ])
  
  useInit(() => {
    if (!uri) return false
    
    RNImage.getSize(uri.toString(), (width, height) => setSize([width, height]))
    return true
  }, [ cid ], [ uri ])
  
  return (
    <View
      style={[{width: '100%'}, containerStyle]}
      onLayout={({ nativeEvent }) => setContentWidth(nativeEvent.layout.width)}
    >
      <IpfsImage {...props} cid={cid} style={[{width, height}, style]} />
    </View>
  )
})

export type IpfsAvatarProps = Omit<React.ComponentProps<typeof Avatar.Image>, 'source'> & {
  cid?: IpfsCache.CID
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
export const IpfsAvatar = React.memo(({ source, cid, style, onPress, ...props }: IpfsAvatarProps) => {
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
})

function getScaledSize(wantW: undefined | number, realW: number, realH: number): [number, number] {
  if (!wantW) return [realW, realH]
  
  // prelimiary size to avoid bloating screen
  if (!realH) return [wantW, 300]
  
  return [wantW, wantW * realH/realW]
}

export type MyIpfsAvatarProps = IpfsAvatarProps & {
  color?: string
}

export const MyIpfsAvatar = React.memo(({ color, size, style, ...props }: MyIpfsAvatarProps) => {
  const { api } = useSubsocial()
  const { address } = useSelectKeypair() ?? {}
  const theme = useTheme()
  const profile = useSelectProfile(address)
  const avatar = profile?.content?.avatar
  const dispatch = useAppDispatch()
  
  useEffect(() => {
    dispatch(fetchProfile({ api, id: address ?? '' }))
  }, [ address ])
  
  if (address) {
    return <IpfsAvatar {...props} style={style} cid={avatar} size={size} />
  }
  else {
    return (
      <View style={style}>
        <Icon
          icon={{
            family: 'ionicon',
            name: 'person-circle-outline'
          }}
          size={size}
          color={color ?? theme.colors.primary}
        />
      </View>
    )
  }
})
