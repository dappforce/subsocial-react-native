//////////////////////////////////////////////////////////////////////
// Simple explorer of statically predefined suggested/curated spaces
// relating to dotsama ecosystem
import React from 'react'
import { Suggested as SuggestedSpaces } from '~stories/Space'
import { asString } from '@subsocial/utils'
import config from 'config.json'

export type DotsamaSpacesProps = {}
export function DotsamaSpaces({}: DotsamaSpacesProps) {
  return (
    <SuggestedSpaces spaces={config.suggestedSpaces.map(asString)} />
  )
}
