import { logger as createLogger } from '@polkadot/util'

const log = createLogger('assert')

export class AssertionError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'AssertionError'
  }
}

export function assert(condition: boolean, message: string) {
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
      log.warn(message)
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
