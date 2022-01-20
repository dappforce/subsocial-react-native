//////////////////////////////////////////////////////////////////////
// Specialized wrapper around Account Details for local account
import React from 'react'
import { useLoadKeypair, useSelectKeypair } from 'src/rtk/app/hooks'
import { SpanningActivityIndicator } from '~comps/SpanningActivityIndicator'
import { Text } from '~comps/Typography'
import { Details, DetailsProps } from './Details'

export type MyAccountProps = Omit<DetailsProps, 'id'>
export const MyAccountDetails = React.memo(({ ...props }: MyAccountProps) => {
  const { address } = useSelectKeypair() ?? {}
  const loaded = useLoadKeypair()
  
  if (!loaded) {
    return <SpanningActivityIndicator />
  }
  
  else if (!address) {
    // TODO: reroute to onboarding
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
