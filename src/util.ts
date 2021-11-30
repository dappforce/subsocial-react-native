//////////////////////////////////////////////////////////////////////
// Simple utility functions independent from RN
import { hexToU8a, isHex, logger } from '@polkadot/util'
import { decodeAddress, encodeAddress, naclSign, naclVerify, randomAsU8a } from '@polkadot/util-crypto'
import Snackbar, { SnackBarOptions } from 'react-native-snackbar'

const assertLog = logger('assert')

type PartitionResult<T> = [T[], T[]]

export class AssertionError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'AssertionError'
  }
}

/**
 * Partition the given array-like in two by the given predicate.
 * @param ary array-like to partition
 * @param predicate by which to partition the array-like
 * @returns tuple of `[pass, fail]` arrays
 */
export function partition<T>(ary: T[], predicate: (elem: T) => boolean) {
  return ary.reduce(([ pass, fail ]: PartitionResult<T>, elem: T) => {
    if (predicate(elem)) {
      return [ [ ...pass, elem ], fail ] as PartitionResult<T>
    }
    
    else {
      return [ pass, [ ...fail, elem ] ] as PartitionResult<T>
    }
  }, [ [], [] ])
}

export function intersection<T>(it1: Iterable<T>, it2: Iterable<T>): Set<T> {
  const set1 = new Set(it1)
  const set2 = new Set(it2)
  const result = new Set<T>()
  
  for (let item of set1) {
    if (set2.has(item)) {
      result.add(item)
    }
  }
  
  for (let item of set2) {
    if (set1.has(item)) {
      result.add(item)
    }
  }
  
  return result
}

export function union<T>(it1: Iterable<T>, it2: Iterable<T>): Set<T> {
  return new Set([ ...it1, ...it2 ])
}

export function difference<T>(it1: Iterable<T>, it2: Iterable<T>): Set<T> {
  const set1 = new Set(it1)
  const set2 = new Set(it2)
  const result = new Set<T>()
  
  for (let item of set1) {
    if (!set2.has(item)) {
      result.add(item)
    }
  }
  
  return result
}

export function setEqual<T>(set1: Set<T>, set2: Set<T>): boolean {
  for (let item of set1) {
    if (!set2.has(item)) return false
  }
  
  for (let item of set2) {
    if (!set1.has(item)) return false
  }
  
  return true
}

export const keys   = <T>(obj: T) => Object.keys(obj) as (keyof T)[]
export const values = <T>(obj: T) => keys(obj).map(key => obj[key])
export const pairs  = <T>(obj: T) => keys(obj).map(key => [ key, obj[key] ] as [ keyof T, T[keyof T] ])

export const descending = (a: any, b: any) => Number(b) - Number(a)

export function assert(condition: boolean, message: string): boolean {
  if (!condition) {
    throw new AssertionError(message)
  }
  return true
}

export type AssertSoftOptions = {
  tag?: string | symbol
}
export function assertSoft(condition: boolean, message: string): boolean
export function assertSoft(condition: boolean, message: string, opts: AssertSoftOptions): boolean
export function assertSoft(condition: boolean, ...args: any[]): boolean {
  let [ message, opts ] = args
  
  const tag = opts?.tag
  
  if (!condition) {
    // log only once per tag to keep logs clean
    if (!tag || !assertSoftLogged[tag]) {
      assertLog.warn(message)
      if (tag) assertSoftLogged[tag] = true
    }
    return false
  }
  
  return true
}
const assertSoftLogged: Record<string | symbol, boolean> = {}

export function assertDefined<T>(value: T | undefined | null, message: string): value is T {
  return assert(value !== undefined, message)
}

export type AssertDefinedSoftOptions = AssertSoftOptions & {
  symbol?: string
}
export function assertDefinedSoft<T>(value: T | undefined | null, message: string): value is T
export function assertDefinedSoft<T>(value: T | undefined | null, opts: AssertDefinedSoftOptions): value is T
export function assertDefinedSoft<T>(value: T | undefined | null, message: string, opts: AssertDefinedSoftOptions): value is T
export function assertDefinedSoft<T>(value: T | undefined | null, ...args: any[]): value is T {
  let [ message, opts ] = args
  
  if (typeof message === 'object') {
    opts = message
    message = `${opts?.symbol || ''} should be defined`.trim()
  }
  
  return assertSoft(value !== undefined, message, opts)
}


/** Simple wrapper around Promise to create try/catch/then/finally syntax */
export function trial<T>(cb: () => T | Promise<T>) {
  return new Promise<T>(async (res, rej) => {
    try {
      res(await cb())
    }
    catch (err) {
      rej(err)
    }
  })
}


// see https://polkadot.js.org/docs/util-crypto/examples/validate-address/
export function validateAddress(address: string): boolean {
  try {
    encodeAddress(isHex(address) ? hexToU8a(address) : decodeAddress(address))
    return true
  }
  catch {
    return false
  }
}

export function validateKeypair(secret: string, address: string): boolean {
  const msg = randomAsU8a()
  const publicKey = isHex(address) ? hexToU8a(address) : decodeAddress(address)
  const secretKey = hexToU8a(secret)
  
  const sig = naclSign(msg, { secretKey })
  return naclVerify(msg, sig, publicKey)
}


export function snack(opts: SnackBarOptions) {
  Snackbar.show(opts)
}

export function delaySnack(opts: SnackBarOptions, delay: number = 100) {
  setTimeout(() => snack(opts), delay)
}


export class Age {
  constructor(public readonly timestamp: number) {
    
  }
  
  toString(): string {
    const diff = Date.now() - this.timestamp
    
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
