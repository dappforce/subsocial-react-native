//////////////////////////////////////////////////////////////////////
// Simple utility functions independent from RN

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
