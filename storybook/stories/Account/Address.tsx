import React from 'react'
import { AccountId } from 'src/types/subsocial'
import { Text, TextProps } from '~comps/Typography'
import { truncateAddress } from './util'

export type AddressProps = TextProps & {
  children?: never
  id: AccountId
}
export const Address = React.memo(({ id, ...props }: AddressProps) => {
  return <Text {...props}>{truncateAddress(id)}</Text>
})
