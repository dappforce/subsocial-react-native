//////////////////////////////////////////////////////////////////////
// Space Explorer - a whole bunch of summaries
import React from 'react'
import { StyleSheet } from 'react-native'
import { Preview } from './Preview'
import { Divider } from 'src/components/Typography'
import { InfiniteScrollList } from '~stories/Misc/InfiniteScroll'
import { SpaceId } from 'src/types/subsocial'
import { useCreateReloadSpace } from 'src/rtk/app/hooks'
import { assertDefinedSoft } from 'src/util'

export type SuggestedProps = {
  spaces: SpaceId[]
}
export function Suggested({ spaces }: SuggestedProps) {
  const reloadSpace = useCreateReloadSpace()
  const renderItem = (id: SpaceId) => <WrappedSpace id={id} />
  
  const loader = async (ids: SpaceId[]) => {
    if (assertDefinedSoft(reloadSpace, { symbol: 'reloadSpace', tag: 'Space/Explorer/loader' })) {
      await Promise.all(ids.map(id => reloadSpace({ id })))
    }
    return ids
  }
  
  return (
    <InfiniteScrollList
      ids={spaces}
      {...{ loader, renderItem }}
    />
  )
}

type WrappedSpaceProps = {
  id: SpaceId
}
const WrappedSpace = React.memo(({ id }: WrappedSpaceProps) => {
  return <>
    <Preview
      id={id}
      showAbout
      showFollowButton
      showTags
      containerStyle={styles.wrappedSpace}
    />
    <Divider />
  </>
})

const styles = StyleSheet.create({
  wrappedSpace: {
    padding: 20,
    paddingBottom: 0,
  },
})
