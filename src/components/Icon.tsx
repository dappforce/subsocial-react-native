//////////////////////////////////////////////////////////////////////
// Wrapper around RNElements Icon with better typing & fixed pressable
import React from 'react'
import { StyleSheet, View } from 'react-native'
import * as Elements from 'react-native-elements'

import * as IconSets from 'glyphmap'
import { TouchableRipple, TouchableRippleProps } from './TouchableRipple'

import SubiconGlyphmap from '../../assets/fonts/subicons.glyphmap.json'
import { createIconSet } from 'react-native-vector-icons'

export type AntIcon = {
  family: 'antdesign'
  name: keyof IconSets.AntDesign
}
export type EntypoIcon = {
  family: 'entypo'
  name: keyof IconSets.Entypo
}
export type EvilIcon = {
  family: 'evilicon'
  name: keyof IconSets.EvilIcons
}
export type FeatherIcon = {
  family: 'feather'
  name: keyof IconSets.Feather
}
export type FontAwesomeIcon = {
  family: 'font-awesome'
  name: keyof IconSets.FontAwesome
}
export type FontAwesome5Icon = {
  family: 'font-awesome-5'
  name: keyof IconSets.FontAwesome5
}
export type FontistoIcon = {
  family: 'fontisto'
  name: keyof IconSets.Fontisto
}
export type FoundationIcon = {
  family: 'foundation'
  name: keyof IconSets.Foundation
}
export type IonIcon = {
  family: 'ionicon'
  name: keyof IconSets.Ionicons
}
export type MaterialIcon = {
  family: 'material'
  name: keyof IconSets.Material
}
export type MaterialCommunityIcon = {
  family: 'material-community'
  name: keyof IconSets.MaterialCommunity
}
export type OctIcon = {
  family: 'octicon'
  name: keyof IconSets.Octicon
}
export type SimpleLineIcon = {
  family: 'simple-line-icon'
  name: keyof IconSets.SimpleLineIcons
}
export type ZocialIcon = {
  family: 'zocial'
  name: keyof IconSets.Zocial
}
export type SubIcon = {
  family: 'subicon'
  name: keyof typeof SubiconGlyphmap
}

export type AnyIcon = AntIcon | EntypoIcon | EvilIcon | FeatherIcon | FontAwesomeIcon | FontAwesome5Icon | FontistoIcon
  | FoundationIcon | IonIcon | MaterialIcon | MaterialCommunityIcon | OctIcon | SimpleLineIcon | ZocialIcon | SubIcon

type RippleProps = Pick<TouchableRippleProps, 'rippleSize' | 'rippleBorderless'>

Elements.registerCustomIconType('subicon', createIconSet(SubiconGlyphmap, 'Subicon'))

export type IconProps = Omit<Elements.IconProps, 'name' | 'type'> & RippleProps & {
  icon: AnyIcon
}
export function Icon({ icon, ...props }: IconProps) {
  return <IconRaw {...icon} {...props} />
}

export type IconRawProps = Omit<Elements.IconProps, 'type'> & RippleProps & {
  family: string
}
export function IconRaw({family, onPress, onPressIn, onPressOut, onLongPress, containerStyle, size = 20, rippleSize = size, rippleBorderless, ...props}: IconRawProps) {
  const icon = (
    <Elements.Icon
      {...props}
      type={family}
      size={size}
    />
  )
  
  const touchable = !!(onPress || onPressIn || onPressOut || onLongPress)
  
  if (touchable) {
    return ( // TODO: Ripple for iOS using react-native-advanced-ripple?
      <TouchableRipple
        {...{
          onPress,
          onPressIn,
          onPressOut,
          onLongPress,
          rippleSize,
          rippleBorderless,
        }}
        style={[styles.container, containerStyle]}
      >
        {icon}
      </TouchableRipple>
    )
  }
  
  else {
    return (
      <View style={[styles.container, containerStyle]}>
        {icon}
      </View>
    )
  }
}

export function isAnyIcon(obj: any): obj is AnyIcon {
  return obj && obj.family && obj.name
}


const styles = StyleSheet.create({
  container: {
    
  },
})
