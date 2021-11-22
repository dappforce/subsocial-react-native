import { useEffect } from 'react'
import { useAppDispatch, useAppSelector } from 'src/rtk/app/hooksCommon'
import { checkForStoredKeypair, selectHasStoredKeypair, selectKeypair } from './localAccountSlice'

export const useSelectKeypair = () => useAppSelector(selectKeypair)

export const useCheckForStoredKeypair = () => {
  const dispatch = useAppDispatch()
  
  useEffect(() => {
    dispatch(checkForStoredKeypair())
  }, [])
  
  return useAppSelector(selectHasStoredKeypair)
}
