//////////////////////////////////////////////////////////////////////
// All the details of a space
import React from 'react'
import { View } from 'react-native'
import { AnySpaceId } from '@subsocial/types'
import Summary from './Summary'
import { useSpace } from './util'

export type OverviewProps = {
  id?: AnySpaceId
  handle?: string
}
export default function Overview({id, handle}: OverviewProps) {
  const [_, data] = useSpace(id, handle);
  return (
    <View style={{width: '100%'}}>
      <Summary {...{id, handle}} showSocials showTags />
    </View>
  )
}
