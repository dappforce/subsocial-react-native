//////////////////////////////////////////////////////////////////////
// Helper class to access images from Subsocial IPFS
// SPDX-License-Identifier: GPL-3.0
import React, { useEffect, useState } from 'react'
import { View, Image, ImageStyle, StyleProp } from 'react-native'
import config from 'config.json'

export type IpfsImageProps = {
  cid?: string
  style?: StyleProp<ImageStyle>
}

export default function IpfsImage({cid, style}: IpfsImageProps) {
  if (!cid) return null;
  
  const [contW, setContentWidth] = useState(0);
  const [[realW, realH], setSize] = useState([0, 0]);
  const [width, height] = getScaledSize(contW, realW, realH);
  const uri = `${config.connections.ipfs}/ipfs/${cid}`;
  
  useEffect(() => {
    Image.getSize(uri, (width, height) => setSize([width, height]));
  }, []);
  
  return (
    <View style={{width: '100%', ...(style as Object)}} onLayout={({nativeEvent}) => setContentWidth(nativeEvent.layout.width)}>
      <Image source={{uri}} style={{...(style as Object), width, height}} />
    </View>
  );
}

function getScaledSize(wantW: undefined | number, realW: number, realH: number): [number, number] {
  if (!wantW) return [realW, realH];
  if (!realH) return [0, 0];
  return [wantW, wantW * realH/realW];
}
