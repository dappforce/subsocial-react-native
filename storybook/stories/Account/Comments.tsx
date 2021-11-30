import React from 'react'
import { AccountId, PostId } from 'src/types/subsocial'
import { InfiniteScrollListProps } from '~stories/Misc'

export type CommentsProps = {
  id: AccountId
  onScroll?: InfiniteScrollListProps<PostId>['onScroll']
}
export function Comments({ id, onScroll }: CommentsProps) {
  return null
}
