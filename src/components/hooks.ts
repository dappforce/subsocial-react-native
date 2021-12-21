//////////////////////////////////////////////////////////////////////
// Common & general purpose hooks
import { DependencyList, MutableRefObject, useCallback, useEffect, useMemo, useRef, useState } from 'react'

export interface InitCallback {
  (isMounted: () => boolean): boolean | Promise<boolean>
}

/** Like useCallback, except returns `undefined` if any item in the dependency list is falsy. */
export function useOptionalCallback<T extends (...args: any[]) => any>(callback: T, deps: DependencyList, needed: DependencyList = deps): T | undefined {
  return useMemo<T | undefined>(() => {
    for (const dep of needed) {
      if (!dep) return undefined
    }
    
    return callback
  }, deps)
}

/**
 * Helper hook for initialization. Run a `cb` once after `deps` changes. Initialization is considered successful if
 * the callback returns true.
 * @param cb initializer callback
 * @param deps dependencies to observe - if any of these changes, initialization will be re-run
 * @returns true if initialization was successful, false otherwise
 */
export function useInit(cb: InitCallback, resetDeps: DependencyList, retryDeps: DependencyList): boolean {
  const [ initialized, setInitialized ] = useState(false)
  const isMounted = useMountState()
  
  useEffect(() => {
    setInitialized(false)
  }, resetDeps)
  
  useEffect(() => {
    if (!initialized) {
      (async() => {
        const init = await cb(isMounted)
        if (init && isMounted()) {
          setInitialized(true)
        }
      })()
    }
  }, [ initialized, ...resetDeps, ...retryDeps ])
  
  return initialized
}

/**
 * Simple `useRef` wrapper tracking whether the component is still mounted. Use as such:
 * 
 * ```
 * const isMounted = useMountedState()
 * if (isMounted.current) {
 *   // ...
 * }
 * ```
 * 
 * @returns mutable ref to a boolean value indicating whether the component is still mounted
 */
export function useMountState() {
  const isMounted = useRef(true)
  const getter = useCallback(() => isMounted.current, [ isMounted ])
  
  useEffect(() => {
    isMounted.current = true
    return () => { isMounted.current = false }
  }, [])
  
  return Object.assign(getter, {
    /** Utility to resolve/continue Promise only if still mounted.
     * 
     * @example
     * ```js
     * const isMounted = useMountedState()
     * 
     * useEffect(() => {
     *   (async() => {
     *     const value = await someAsyncCall().then(isMounted.gate)
     *     console.log('guaranteed to be still mounted')
     *   })()
     * }, [])
     * ```
     */
    gate: <T>(v: T) => new Promise<T>((resolve) => {isMounted.current && resolve(v)}),
  })
}
