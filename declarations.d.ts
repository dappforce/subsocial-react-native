declare module '*.svg' {
  import React from 'react'
  import { SvgProps } from 'react-native-svg'
  
  const content: React.FC<SvgProps>
  export default content
}

declare module 'glyphmap' {
  import AntDesignMap from 'react-native-vector-icons/glyphmaps/AntDesign.json'
  export type AntDesign = typeof AntDesignMap
  
  import EntypoMap from 'react-native-vector-icons/glyphmaps/Entypo.json'
  export type Entypo = typeof EntypoMap
  
  import EvilIconsMap from 'react-native-vector-icons/glyphmaps/EvilIcons.json'
  export type EvilIcons = typeof EvilIconsMap
  
  import FeatherMap from 'react-native-vector-icons/glyphmaps/Feather.json'
  export type Feather = typeof FeatherMap
  
  import FontAwesomeMap from 'react-native-vector-icons/glyphmaps/FontAwesome.json'
  export type FontAwesome = typeof FontAwesomeMap
  
  import FontAwesome5FreeMap from 'react-native-vector-icons/glyphmaps/FontAwesome5Free.json'
  import FontAwesome5ProMap from 'react-native-vector-icons/glyphmaps/FontAwesome5Pro.json'
  export type FontAwesome5 = typeof FontAwesome5FreeMap | typeof FontAwesome5ProMap
  
  import FontistoMap from 'react-native-vector-icons/glyphmaps/Fontisto.json'
  export type Fontisto = typeof FontistoMap
  
  import FoundationMap from 'react-native-vector-icons/glyphmaps/Foundation.json'
  export type Foundation = typeof FoundationMap
  
  import IoniconsMap from 'react-native-vector-icons/glyphmaps/Ionicons.json'
  export type Ionicons = typeof IoniconsMap
  
  import MaterialMap from 'react-native-vector-icons/glyphmaps/MaterialIcons.json'
  export type Material = typeof MaterialMap
  
  import MaterialCommunityMap from 'react-native-vector-icons/glyphmaps/MaterialCommunityIcons.json'
  export type MaterialCommunity = typeof MaterialCommunityMap
  
  import OcticonMap from 'react-native-vector-icons/glyphmaps/Octicons.json'
  export type Octicon = typeof OcticonMap
  
  import SimpleLineIconsMap from 'react-native-vector-icons/glyphmaps/SimpleLineIcons.json'
  export type SimpleLineIcons = typeof SimpleLineIconsMap
  
  import ZocialMap from 'react-native-vector-icons/glyphmaps/Zocial.json'
  export type Zocial = typeof ZocialMap
}
