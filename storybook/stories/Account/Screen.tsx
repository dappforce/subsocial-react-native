//////////////////////////////////////////////////////////////////////
// React Navigation-enabled wrapper around Account Details
import React from 'react'
import { Route } from '@react-navigation/routers'
import { AccountId } from 'src/types/subsocial'

export type RouteParams = {
  accountId: AccountId
}

export type ScreenProps = {
  route: Route<'Account', RouteParams>
}
export function Screen({route}: ScreenProps) {
  return null
}
