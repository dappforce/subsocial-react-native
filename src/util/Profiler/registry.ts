//////////////////////////////////////////////////////////////////////
// Epicentral & global tag-based profiler registry
// Currently can only handle runtime measurements
import { produce } from 'immer'

type Registry = Record<string, ProfileData>

type ProfileData = {
  path: string
  samples: number
  totalDuration: number
  averageDuration: number
  lastDuration: number
}

var warnThreshold = 3000
var lastReport: ProfileData[] = []
const registry: Registry = {}

export function start(tag: string, parent: string = '') {
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

export function report(_filter?: string[]) {
  // TODO: nicer output
  const filter = new Set(_filter)
  const entries = Object.values(registry).filter(entry => !filter.size || filter.has(entry.path))
  
  if (entries.length === 0) {
    console.debug('no profiling data')
  }
  else if (!isDeepEqual(lastReport, entries)) {
    lastReport = deepCopy(entries)
    
    console.log('Profile:')
    entries.forEach(entry => {
      console.log(`-- ${entry.path}: ${entry.samples} samples, ${entry.totalDuration}ms total, ${entry.averageDuration}ms average, ${entry.lastDuration}ms last`)
    })
  }
}

export const setWarnThreshold = (threshold: number) => warnThreshold = threshold
export const getWarnThreshold = () => warnThreshold

function createEntry(path: string): ProfileData {
  return {
    path,
    samples: 0,
    totalDuration: 0,
    averageDuration: 0,
    lastDuration: 0,
  }
}

function isDeepEqual(a: any, b: any) {
  return JSON.stringify(a) === JSON.stringify(b)
}

function deepCopy(obj: any) {
  return JSON.parse(JSON.stringify(obj))
}
