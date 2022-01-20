import React from 'react'
import { StyleSheet } from 'react-native'
import { AccountId, PostId } from 'src/types/subsocial'
import { Text } from '~comps/Typography'
import { InfiniteScrollListProps } from '~stories/Misc'

export type CommentsProps = {
  id: AccountId
  onScroll?: InfiniteScrollListProps<PostId>['onScroll']
}
export function Comments({ id, onScroll }: CommentsProps) {
  return <Text mode="secondary" style={styles.empty}>Under construction ...</Text>
}

const styles = StyleSheet.create({
  empty: {
    textAlign: 'center',
    marginVertical: 10,
  },
})
