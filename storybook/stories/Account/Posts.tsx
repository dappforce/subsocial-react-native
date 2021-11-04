import React from 'react'
import { AccountId } from 'src/types/subsocial'
import { Text } from '~comps/Typography'

export type PostsProps = {
  id: AccountId
}
export function Posts({ id }: PostsProps) {
  return <Text>Placeholder</Text>
}
