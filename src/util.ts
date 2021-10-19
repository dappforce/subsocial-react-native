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
  private timestamp: BN
  private now: BN
  
  constructor(timestamp: BN) {
    this.timestamp = timestamp;
    this.now = new BN(Date.now());
  }
  
  toString(): string {
    const diff = this.now.sub(this.timestamp);
    if (diff.lt(BN_ZERO)) {
      return 'in the future'
    }
    if (diff.lt(BN_1DAY)) {
      return diff.divn(3600) + 'h'
    }
    if (diff.lt(BN_1WEEK)) {
      return diff.div(BN_1DAY) + 'd'
    }
    if (diff.lt(BN_1MONTH)) {
      return diff.div(BN_1WEEK) + 'w'
    }
    if (diff.lt(BN_1YEAR)) {
      return diff.div(BN_1MONTH) + 'M'
    }
    else {
      return diff.div(BN_1YEAR) + 'y'
    }
  }
}

const BN_1DAY   = new BN(86400000)
const BN_1WEEK  = BN_1DAY.muln(7)
const BN_1MONTH = BN_1DAY.muln(30)
const BN_1YEAR  = BN_1DAY.muln(365)
