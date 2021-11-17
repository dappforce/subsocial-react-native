import { useAppSelector } from 'src/rtk/app/hooksCommon'
import { selectKeypair } from './localAccountSlice'

export const useSelectKeypair = () => useAppSelector(selectKeypair)
