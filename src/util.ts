//////////////////////////////////////////////////////////////////////
// Simple utility functions independent from RN
import { BN, BN_ZERO } from '@polkadot/util'

export type IconFamily = 'antdesign' | 'entypo' | 'evilicon' |
  'feather' | 'font-awesome' | 'font-awesome-5' | 'fontisto' |
  'ionicon' | 'material' | 'material-community' | 'octicon' |
  'simple-line-icon' | 'zocial'

/**
 * Partition the given array-like in two by the given predicate.
 * @param ary array-like to partition
 * @param predicate by which to partition the array-like
 * @returns tuple of `[pass, fail]` arrays
 */
export function partition<T>(ary: T[], predicate: (elem: T) => boolean) {
  return ary.reduce(([pass, fail]: [T[], T[]], elem: T) => {
    if (predicate(elem)) {
      return [[...pass, elem], fail] as [T[], T[]]
    }
    else {
      return [pass, [...fail, elem]] as [T[], T[]]
    }
  }, [[], []]);
}

export const keys   = <T>(obj: T) => Object.keys(obj) as (keyof T)[];
export const values = <T>(obj: T) => keys(obj).map(key => obj[key]);
export const pairs  = <T>(obj: T) => keys(obj).map(key => [key, obj[key]] as [keyof T, T[keyof T]])

export class Age {
  private timestamp: number
  
  constructor(timestamp: number) {
    this.timestamp = timestamp;
  }
  
  toString(): string {
    const diff = Date.now() - this.timestamp;
    if (diff < 0) {
      return 'in the future'
    }
    if (diff < ONE_HOUR) {
      return Math.floor(diff / 60000) + 'm'
    }
    if (diff < ONE_DAY) {
      return Math.floor(diff / 3600000) + 'h'
    }
    if (diff < ONE_WEEK) {
      return Math.floor(diff / ONE_DAY) + 'd'
    }
    if (diff < ONE_MONTH) {
      return Math.floor(diff / ONE_WEEK) + 'w'
    }
    if (diff < ONE_YEAR) {
      return Math.floor(diff / ONE_MONTH) + 'M'
    }
    else {
      return Math.floor(diff / ONE_YEAR) + 'Y'
    }
  }
}

const ONE_HOUR  = 3600000
const ONE_DAY   = ONE_HOUR * 24
const ONE_WEEK  = ONE_DAY * 7
const ONE_MONTH = ONE_DAY * 30
const ONE_YEAR  = ONE_DAY * 365
