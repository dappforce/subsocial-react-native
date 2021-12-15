import { useEffect } from 'react'
import { useAppDispatch, useAppSelector } from 'src/rtk/app/hooksCommon'
import { useInit } from '~comps/hooks'
import { useSubsocial } from '~comps/SubsocialContext'
import { useSelectProfile } from '../profiles/profilesHooks'
import { fetchProfile } from '../profiles/profilesSlice'
import { checkForStoredKeypair, loadKeypair, selectHasStoredKeypair, selectKeypair } from './localAccountSlice'

export const useSelectKeypair = () => useAppSelector(selectKeypair)

export const useCheckForStoredKeypair = () => {
  const dispatch = useAppDispatch()
  
  useEffect(() => {
    dispatch(checkForStoredKeypair())
  }, [])
  
  return useAppSelector(selectHasStoredKeypair)
}

export const useLoadKeypair = () => {
  const keypair = useSelectKeypair()
  const dispatch = useAppDispatch()
  
  return useInit(async () => {
    if (!keypair) await dispatch(loadKeypair())
    return true
  }, [], [])
}

export const useMyProfile = () => {
  const { api } = useSubsocial()
  const { address } = useSelectKeypair() ?? {}
  const profile = useSelectProfile(address)
  const dispatch = useAppDispatch()
  
  useEffect(() => {
    if (address) {
      dispatch(fetchProfile({ api, id: address }))
    }
  }, [ address ])
  
  return profile
}
