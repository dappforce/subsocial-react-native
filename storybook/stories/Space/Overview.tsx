//////////////////////////////////////////////////////////////////////
// All the details of a space
import React from 'react'
import { View } from 'react-native'
import { AnySpaceId } from '@subsocial/types'
import Summary from './Summary'
import { useSpace } from './util'

export type OverviewProps = {
  id: string | AnySpaceId
}
export default function Overview({id}: OverviewProps) {
  const [_, data] = useSpace(id);
  return (
    <View style={{width: '100%'}}>
      <Summary {...{id}} showSocials showTags />
    </View>
  )
}
