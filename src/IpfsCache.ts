//////////////////////////////////////////////////////////////////////
// Simple key-value based cache for IPFS content. To be replaced by
// standardized RTK solution in the future.
// Due to the nature of IPFS & content being addressed by its hash,
// cache is global. If the content changes, so does its hash/address.
// -----
// TODO: Perhaps use multiformats module to better inspect CIDs?
// TODO: Hot cache in memory?
import * as fs from 'expo-file-system'
import axios from 'axios'
import { immerable } from 'immer'
import { CommentContent, CommonContent, PostContent, ProfileContent, SharedPostContent, SpaceContent } from '@subsocial/types'
import { logger as createLogger } from '@polkadot/util'
import config from 'config.json'

const CONTENT_CACHE_DIR = '/content/'
const IMAGE_CACHE_DIR = '/image/'
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

export async function queryImage(cids: CID[]): Promise<Record<CID, URL>> {
  if (!fs.cacheDirectory) {
    logNoCache()
    return queryImageLive(cids)
  }
  
  else {
    const cached = await queryImageCache(cids)
    const missed = cids.filter(cid => !cached[cid])
    const fetched = await queryImageLive(missed)
    return { ...cached, ...fetched }
  }
}

export async function queryImageCache(cids: CID[]): Promise<Record<CID, URL>> {
  if (!fs.cacheDirectory) {
    logNoCache()
    return {}
  }
  
  const baseUrl = imageBaseUrl()
  const result: Record<CID, URL> = {}
  
  await Promise.all(cids.map(async cid => {
    const url = new URL(`${baseUrl}/${cid}`)
    const info = await fs.getInfoAsync(url.toString())
    if (info.exists) {
      result[cid] = url
    }
  }))
  
  return result
}

export async function queryImageLive(cids: CID[]): Promise<Record<CID, URL>> {
  if (!fs.cacheDirectory) {
    logNoCache()
    return Object.fromEntries(cids.map(cid => [ cid, new URL(`${config.connections.ipfs}/ipfs/${cid}`) ]))
  }
  
  else {
    const baseUrl = imageBaseUrl()
    await fs.makeDirectoryAsync(baseUrl.toString(), { intermediates: true })
    
    await Promise.all(cids.map(async cid => {
      const remote = new URL(`${config.connections.ipfs}/ipfs/${cid}`)
      const local  = new URL(`${baseUrl}/${cid}`)
      await fs.downloadAsync(remote.toString(), local.toString())
    }))
    return Object.fromEntries(cids.map(cid => [ cid, new URL(`${imageBaseUrl()}/${cid}`) ]))
  }
}

const contentBaseUrl = () => new URL(`${fs.cacheDirectory}/${CONTENT_CACHE_DIR}/`)
const imageBaseUrl = () => new URL(`${fs.cacheDirectory}/${IMAGE_CACHE_DIR}/`)

function logNoCache() {
  if (!loggedNoCacheOnce) {
    console.warn('No expo-fs cacheDirectory, caching is disabled')
    loggedNoCacheOnce = true
  }
}

var loggedNoCacheOnce = false
