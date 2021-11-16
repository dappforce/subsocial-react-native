import React from 'react'
import { AccountId, PostId } from 'src/types/subsocial'
import { DynamicExpansionListProps } from '~stories/Misc'

export type CommentsProps = {
  id: AccountId
  onScroll?: DynamicExpansionListProps<PostId>['onScroll']
}
export function Comments({ id, onScroll }: CommentsProps) {
  return null
}
