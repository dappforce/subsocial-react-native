//////////////////////////////////////////////////////////////////////
// Simple key-value based cache for IPFS content. To be replaced by
// standardized RTK solution in the future.
// Due to the nature of IPFS & content being addressed by its hash,
// cache is global. If the content changes, so does its hash/address.
// -----
// TODO: Perhaps use multiformats module to better inspect CIDs?
// TODO: Hot cache in memory?
import * as fs from 'expo-file-system'
import { immerable } from 'immer'
import { CommentContent, CommonContent, PostContent, ProfileContent, SharedPostContent, SpaceContent } from '@subsocial/types'
import { logger as createLogger } from '@polkadot/util'

const CONTENT_CACHE_DIR = '/content/'
const log = createLogger('IpfsCache')

export type CID = string

export class CachedContent {
  [immerable] = true
  
  constructor(public readonly cid: CID, public readonly data: string) {}
  
  asContent = <T extends CommonContent>() => JSON.parse(this.data) as T
  
  asSpaceContent = () => this.asContent<SpaceContent>()
  asProfileContent = () => this.asContent<ProfileContent>()
  asPostContent = () => this.asContent<PostContent>()
  asCommentContent = () => this.asContent<CommentContent>()
  asSharedPostContent = () => this.asContent<SharedPostContent>()
}

export async function queryContentCache(cids: CID[]): Promise<Record<CID, CachedContent>> {
  if (!fs.cacheDirectory) {
    logNoCache()
    return {}
  }
  
  const baseUrl = contentBaseUrl()
  const result: Record<CID, CachedContent> = {}
  
  log.debug('Query IPFS Cache for', cids)
  
  await Promise.all(cids.map(async cid => {
    const url = new URL(`${baseUrl}/${cid}`)
    try {
      result[cid] = new CachedContent(cid, await fs.readAsStringAsync(url.toString(), { encoding: 'utf8' }))
    }
    catch {}
  }))
  
  const missed = cids.filter(cid => !result[cid])
  if (missed.length)
    log.debug('IPFS Cache miss on', missed)
  
  return result
}

export async function cacheContent(contents: Record<CID, string>) {
  if (!fs.cacheDirectory) {
    logNoCache()
    return
  }
  
  log.debug(`Caching IPFS contents`, Object.keys(contents))
  
  const baseUrl = contentBaseUrl()
  await fs.makeDirectoryAsync(baseUrl.toString(), { intermediates: true })
  
  await Promise.all(Object.entries(contents).map(async ([ cid, data ]) => {
    const url = new URL(`${baseUrl}/${cid}`)
    await fs.writeAsStringAsync(url.toString(), data, { encoding: 'utf8' })
  }))
}

const contentBaseUrl = () => new URL(`${fs.cacheDirectory}/${CONTENT_CACHE_DIR}/`)

function logNoCache() {
  if (!loggedNoCacheOnce) {
    console.warn('No expo-fs cacheDirectory, caching is disabled')
    loggedNoCacheOnce = true
  }
}

var loggedNoCacheOnce = false
