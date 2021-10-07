//////////////////////////////////////////////////////////////////////
// Simple background color context & provider
// SPDX-License-Identifier: GPL-3.0
import React, { useContext } from 'react'
import { useColorScheme } from 'react-native'

export const BackgroundColorContext = React.createContext('black');
export const useBackgroundColor = () => useContext(BackgroundColorContext);

export type BackgroundColorProviderProps = React.PropsWithChildren<{
  color: string
}>
export type BackgroundColorSchemeProviderProps = React.PropsWithChildren<{
  light: string
  dark: string
  default?: 'light' | 'dark'
}>

export function BackgroundColorProvider({children, color}: BackgroundColorProviderProps) {
  return (
    <BackgroundColorContext.Provider value={color}>
      {children}
    </BackgroundColorContext.Provider>
  )
}
