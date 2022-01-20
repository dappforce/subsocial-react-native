//////////////////////////////////////////////////////////////////////
// Algorithms & Data Structures helpers

type PartitionResult<T> = [T[], T[]]

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
