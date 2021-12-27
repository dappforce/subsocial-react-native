//////////////////////////////////////////////////////////////////////
// Epicentral & global tag-based profiler registry
// Currently can only handle runtime measurements
type Registry = Record<string, ProfileData>

type ProfileData = {
  path: string
  samples: number
  totalDuration: number
  averageDuration: number
  lastDuration: number
}

export type Profile = {
  [item: string]: ProfileItem
}

type ProfileItem = Omit<ProfileData, 'path'> & {
  tag: string
  children: Profile
}

var warnThreshold = 3000
var lastReport: ProfileData[] = []
const registry: Registry = {}
const PROD_FINISH = Object.assign(() => {}, {
  path: '',
  promise: <T>(p: Promise<T>) => p,
})

export function start(tag: string, parent: string = '') {
  if (!__DEV__) return PROD_FINISH
  
  const path = parent ? `${parent}/${tag}` : tag
  const t0 = Date.now()
  let finished = false
  
  if (!registry[path]) {
    registry[path] = createEntry(path)
  }
  
  const timeout = setTimeout(() => {
    console.warn(`${path} is taking a long time to complete (>${warnThreshold}ms)`)
  }, warnThreshold)
  
  const finish = () => {
    if (finished) {
      console.warn(`${path} was finished more than once`)
      return
    }
    
    finished = true
    clearTimeout(timeout)
    
    const dt = Date.now() - t0
    const entry = registry[path]
    entry.samples++
    entry.totalDuration += dt
    entry.lastDuration = dt
    entry.averageDuration = entry.totalDuration / entry.samples
  }
  
  return Object.assign(finish, {
    path,
    promise: async <T>(p: Promise<T>) => {
      try {
        return await p
      }
      finally {
        finish()
      }
    },
  })
}

export function report(filter?: string[]) {
  if (!__DEV__) return
  
  // TODO: nicer output
  const report = createReport(new Set(filter))
  
  if (Object.keys(report).length === 0) {
    console.debug('no profiling data')
  }
  else if (!isDeepEqual(lastReport, report)) {
    lastReport = deepCopy(report)
    
    console.log('Profile:')
    printProfile(report)
  }
}

function printProfile(profile: Profile, level: number = 1) {
  const indent = '--'.repeat(level)
  
  Object.values(profile).forEach(item => {
    const {
      tag,
      samples,
      totalDuration,
      averageDuration,
      lastDuration,
    } = item
    
    console.log(`${indent} ${tag}: ${samples} samples, ${totalDuration}ms total, ${averageDuration}ms average, ${lastDuration}ms last`)
    printProfile(item.children, level + 1)
  })
}

export function createReport(filter: Set<string>): Profile {
  const result: Profile = {}
  const items = Object.values(registry).filter(entry => !filter.size || filter.has(entry.path))
  
  items.forEach(item => {
    const { path, ...props } = item
    const parts = path.split('/')
    const tag = parts.pop() as string
    
    const stem = getProfilePath(result, parts)
    if (!stem[tag]) {
      stem[tag] = {
        tag,
        ...props,
        children: {},
      }
    }
    else {
      console.warn(`Duplicate profile entry ${path}`)
    }
  })
  
  return result
}

export function makepath(tag: string, parent?: string): string {
  return parent ? `${parent}/${tag}` : tag
}

export const setWarnThreshold = (threshold: number) => warnThreshold = threshold
export const getWarnThreshold = () => warnThreshold

export const enable = () => {
  _enabled = true
}
export const disable = () => {
  _enabled = false
}
var _enabled = true;

function createEntry(path: string): ProfileData {
  return {
    path,
    samples: 0,
    totalDuration: 0,
    averageDuration: 0,
    lastDuration: 0,
  }
}

function createItem(tag: string): ProfileItem {
  return {
    tag,
    samples: 0,
    totalDuration: 0,
    averageDuration: 0,
    lastDuration: 0,
    children: {},
  }
}

function getProfilePath(profile: Profile, parts: string[]): Profile {
  let current = profile
  for (let part of parts) {
    if (!current[part]) {
      current[part] = createItem(part)
    }
    
    current = current[part].children
  }
  return current
}

function isDeepEqual(a: any, b: any) {
  return JSON.stringify(a) === JSON.stringify(b)
}

function deepCopy(obj: any) {
  return JSON.parse(JSON.stringify(obj))
}
