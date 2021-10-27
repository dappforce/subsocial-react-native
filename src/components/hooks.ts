//////////////////////////////////////////////////////////////////////
// Common & general purpose hooks
import { DependencyList, useEffect, useState } from 'react'

export interface InitCallback {
  (): boolean | Promise<boolean>
}

/**
 * Helper hook for initialization. Run a `cb` once after `deps` changes. Initialization is considered successful if
 * the callback returns true.
 * @param cb initializer callback
 * @param deps dependencies to observe - if any of these changes, initialization will be re-run
 */
export function useInit(cb: InitCallback, resetDeps: DependencyList, retryDeps: DependencyList) {
  const [initialized, setInitialized] = useState(false)
  
  useEffect(() => {
    setInitialized(false)
  }, resetDeps)
  useEffect(() => {
    if (!initialized) {
      if (cb()) {
        setInitialized(true)
      }
    }
  }, [initialized, ...retryDeps])
}
