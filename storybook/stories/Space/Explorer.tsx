//////////////////////////////////////////////////////////////////////
// Space Explorer - a whole bunch of summaries
import React from 'react'
import { StyleSheet } from 'react-native'
import { Preview } from './Preview'
import { Divider } from 'src/components/Typography'
import { DynamicExpansionList } from '~stories/Misc/InfiniteScroll'
import { SpaceId } from 'src/types/subsocial'
import { useCreateReloadSpace } from 'src/rtk/app/hooks'

export type SuggestedProps = {
  spaces: SpaceId[]
}
export function Suggested({spaces}: SuggestedProps) {
  const reloadSpace = useCreateReloadSpace()
  const renderItem = (id: SpaceId) => <WrappedSpace id={id} />
  
  const loader = async (ids: SpaceId[]) => {
    ids.forEach(id => {
      reloadSpace?.({id})
    })
  }
  
  return (
    <DynamicExpansionList
      ids={spaces}
      {...{loader, renderItem}}
    />
  )
}

type WrappedSpaceProps = {
  id: SpaceId
}
const WrappedSpace = React.memo(({id}: WrappedSpaceProps) => {
  return <>
    <Preview
      id={id}
      showAbout
      showFollowButton
      showTags
      preview
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
});
