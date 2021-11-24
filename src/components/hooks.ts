//////////////////////////////////////////////////////////////////////
// Common & general purpose hooks
import { DependencyList, MutableRefObject, useEffect, useRef, useState } from 'react'

export interface InitCallback {
  (isMounted: MutableRefObject<boolean>): boolean | Promise<boolean>
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
        if (init && isMounted.current) {
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
  useEffect(() => {
    return () => { isMounted.current = false }
  }, [])
  return isMounted
}
