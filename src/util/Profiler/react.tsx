import React, { ComponentType, useEffect } from 'react'
import { report, start } from './registry'

export type TimedParams = {
  tag: string
  memoize?: boolean
}

export type ExtraTimedProps = {
  timed: {
    path: string
  }
}

export function timed<T>(Comp: ComponentType<T & ExtraTimedProps>, params: TimedParams) {
  const { memoize } = params
  
  const _comp = (props: T) => {
    const {
      tag,
    } = params
    
    const finish = start(tag)
    const prop: ExtraTimedProps['timed'] = {
      path: finish.path,
    }
    const result = <Comp {...props} timed={prop} />
    finish()
    return result
  }
  
  if (memoize) {
    return React.memo(_comp)
  }
  else {
    return _comp
  }
}

export function useIntervalReport(duration: number = 5000) {
  useEffect(() => {
    const interval = setInterval(() => {
      report()
    }, duration)
    
    return () => {clearInterval(interval)}
  }, [])
}
