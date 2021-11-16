import React from 'react'
import { AccountId } from 'src/types/subsocial'
import { DynamicExpansionListProps } from '~stories/Misc'

export type UpvotesProps = {
  id: AccountId
  onScroll?: DynamicExpansionListProps<unknown>['onScroll']
}
export function Upvotes({ id, onScroll }: UpvotesProps) {
  return null
}
