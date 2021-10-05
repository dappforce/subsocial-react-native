import React from 'react'
import { TouchableHighlight } from 'react-native'

type ButtonProps = React.PropsWithChildren<{
  onPress: () => void
}>

export default function Button({onPress, children}: ButtonProps) {
  return <TouchableHighlight onPress={onPress??noop}>{children}</TouchableHighlight>;
}

const noop = () => undefined;
