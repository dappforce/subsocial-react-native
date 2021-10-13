//////////////////////////////////////////////////////////////////////
// Space Explorer - a whole bunch of summaries
import React from 'react'
import { StyleSheet, View } from 'react-native'
import { AnySpaceId } from '@subsocial/types'
import Summary from './Summary'

export type PreviewExplorerProps = {
  spaces: (string|AnySpaceId)[]
}
export function PreviewExplorer({spaces}: PreviewExplorerProps) {
  return (
    <View style={styles.container}>
      {spaces.map(space => <Summary key={space.toString()} id={space} showTags preview />)}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
})
