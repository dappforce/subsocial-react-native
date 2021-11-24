//////////////////////////////////////////////////////////////////////
// Specialized wrapper around Account Details for local account
import React from 'react'
import { useSelectKeypair } from 'src/rtk/app/hooks'
import { useAppDispatch } from 'src/rtk/app/hooksCommon'
import { loadKeypair } from 'src/rtk/features/accounts/localAccountSlice'
import { useInit } from '~comps/hooks'
import { SpanningActivityIndicator } from '~comps/SpanningActivityIndicator'
import { Text } from '~comps/Typography'
import { Details, DetailsProps } from './Details'

export type MyAccountProps = Omit<DetailsProps, 'id'>
export const MyAccountDetails = React.memo(({ ...props }: MyAccountProps) => {
  const dispatch = useAppDispatch()
  const { address } = useSelectKeypair() ?? {}
  
  const initialized = useInit(async () => {
    if (!address) await dispatch(loadKeypair())
    return true
  }, [ address ], [])
  
  if (!initialized) {
    return <SpanningActivityIndicator />
  }
  
  else if (!address) {
    return (
      <Text style={{ textAlign: 'center' }}>Please log in to see your account details</Text>
    )
  }
  
  else {
    return (
      <Details id={address} {...props} />
    )
  }
})
