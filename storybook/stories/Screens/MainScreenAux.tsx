import React, { ReactNode } from 'react'
import { Opt } from 'src/types'

export type MainScreenAuxState = {
  setAuxiliary: (comp: Opt<ReactNode>) => void
  auxiliary: Opt<ReactNode>
}

export const MainScreenAuxContext = React.createContext<Opt<MainScreenAuxState>>(undefined)
export const useMainScreenAux = () => React.useContext(MainScreenAuxContext)
