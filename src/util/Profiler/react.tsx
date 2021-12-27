import React, { ComponentType, useEffect } from 'react'
import { disable, report, start } from './registry'

if (!__DEV__) disable()

export type Profile = {
  path?: string
}

export type ProfilingProps = {
  profile?: {
    tag?: string
    path?: string
  }
}

export const ProfileContext = React.createContext<Profile>({})

export type ProfileProviderProps = {
  children?: React.ReactNode
  tag?: string
  path?: string
}

export function ProfileProvider({ children, tag, path }: ProfileProviderProps) {
  const parent = useProfile()
  
  return (
    <ProfileContext.Provider value={{ path: pathFromProp({ tag, path: path ?? parent.path }) }}>
      {children}
    </ProfileContext.Provider>
  )
}

export type WithContextParams = {
  tag?: string
  path?: string
}

export function withContext<T>(Comp: ComponentType<T>, { tag, path }: WithContextParams = {}) {
  if (!__DEV__) return Comp
  
  return (props: T) => {
    if ('profile' in props) console.warn('Ignoring profile prop in withContext')
    
    return (
      <ProfileProvider tag={tag} path={path}>
        <ProfileContext.Consumer>
          {({ path }) => <Comp {...props} profile={{ tag, path }} />}
        </ProfileContext.Consumer>
      </ProfileProvider>
    )
  }
}

export type TimedParams = {
  tag: string
  memoize?: boolean
  withContext?: boolean
}

export function timed<T>(Comp: ComponentType<T & ProfilingProps>, params: TimedParams) {
  if (!__DEV__) return Comp
  
  const { memoize, withContext } = params
  
  const comp = (props: T & ProfilingProps) => {
    const { tag = params.tag, path } = props.profile ?? {}
    
    const finish = start(tag, path)
    const result = withContext
      ? (
          <ProfileProvider tag={tag} path={path}>
            <ProfileContext.Consumer>
              {({ path }) => <Comp {...props} profile={{ tag, path }} />}
            </ProfileContext.Consumer>
          </ProfileProvider>
        )
      : <Comp {...props} profile={{ tag, path }} />
    finish()
    return result
  }
  
  if (memoize) {
    return React.memo(comp)
  }
  else {
    return comp
  }
}

export function useIntervalReport(duration: number = 5000) {
  if (!__DEV__) return
  
  useEffect(() => {
    const interval = setInterval(() => {
      report()
    }, duration)
    
    return () => {clearInterval(interval)}
  }, [])
}

export const useProfile = (): Profile => __DEV__ ? React.useContext(ProfileContext) : {}

export function pathFromProp(profile: ProfilingProps['profile']) {
  if (!profile) return undefined
  
  const { tag, path } = profile
  if (!tag) return undefined
  
  return path ? `${path}/${tag}` : tag
}
