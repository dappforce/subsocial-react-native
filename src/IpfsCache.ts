//////////////////////////////////////////////////////////////////////
// Simple key-value based cache for IPFS content. To be replaced by
// standardized RTK solution in the future.
// Due to the nature of IPFS & content being addressed by its hash,
// cache is global. If the content changes, so does its hash/address.
// -----
// TODO: Perhaps use multiformats module to better inspect CIDs?
// TODO: Hot cache in memory?
import * as fs from 'expo-file-system'
import { CommentContent, CommonContent, PostContent, ProfileContent, SharedPostContent, SpaceContent } from '@subsocial/types';
import { pairs } from './util';

export type CID = string

export type QueryCacheOptions = {
  binary?: boolean
}
/**
 * Query the cache for a list of given CIDs. Returns a mapping of CIDs to content for each cached CID. If a CID is not
 * in this mapping this CID was not previously cached.
 * @param cids to query from cache
 * @param options.binary whether to read data as base64-encoded string
 * @returns Mapping of CIDs to content strings
 */
export async function queryCache(cids: CID[], {binary = false}: QueryCacheOptions = {}): Promise<Record<CID, string>> {
  if (!fs.cacheDirectory) {
    logNoCache();
    return {};
  }
  
  const baseUrl = fs.cacheDirectory + 'ipfs';
  const options = {
    encoding: binary ? fs.EncodingType.Base64 : fs.EncodingType.UTF8,
  };
  
  const result: Record<CID, string> = {};
  await Promise.all(cids.map(async cid => {
    try {
      const content = await fs.readAsStringAsync(`${baseUrl}/${cid}`, options);
      result[cid] = content;
    }
    catch {}
  }));
  
  return result;
}

/**
 * Queries the given CIDs from cache & attempts to restore their content. Content is always assumed to be well-formed
 * JSON in the appropriate format `T`. Thus, non-binary/UTF8 encoding is assumed as well. No further type checking to
 * assert the content is *actually* of type `T` occurs.
 * 
 * Note: If an error occurs during JSON parsing the error is logged and omitted from the returned mapping.
 * 
 * @param cids of content to query
 * @returns Mapping of CIDs to content JSON objects
 */
export async function queryContentCache<T extends CommonContent>(cids: CID[]): Promise<Record<CID, T>> {
  const raws = await queryCache(cids);
  const result: Record<CID, T> = {};
  for (let cid in raws) {
    try {
      result[cid] = JSON.parse(raws[cid]);
    }
    catch (err) {
      console.error(`failed to parse JSON of CID ${cid}:`, err);
    }
  }
  return result;
}

export const queryCommentCache    = (cids: CID[]) => queryContentCache<CommentContent>(cids);
export const queryPostCache       = (cids: CID[]) => queryContentCache<PostContent>(cids);
export const queryProfileCache    = (cids: CID[]) => queryContentCache<ProfileContent>(cids);
export const querySharedPostCache = (cids: CID[]) => queryContentCache<SharedPostContent>(cids);
export const querySpaceCache      = (cids: CID[]) => queryContentCache<SpaceContent>(cids);

export type CacheOptions = {
  binary?: boolean
}
/**
 * Store the given contents in cache. If `binary`, data must be passed as pre-encoded Base64 string. If caching of a
 * record fails, it is logged & skipped.
 * @param contents mapping of CIDs to content strings to cache
 */
export async function cache(contents: Record<CID, string>, {binary = false}: CacheOptions = {}) {
  if (!fs.cacheDirectory) {
    logNoCache();
    return;
  }
  
  const baseUrl = fs.cacheDirectory + 'ipfs';
  const options = {
    encoding: binary ? fs.EncodingType.Base64 : fs.EncodingType.UTF8,
  };
  
  await fs.makeDirectoryAsync(baseUrl, {intermediates: true});
  
  await Promise.all(pairs(contents).map(async ([cid, content]) => {
    try {
      await fs.writeAsStringAsync(`${baseUrl}/${cid}`, content, options);
    }
    catch (err) {
      console.warn(`failed to cache CID ${cid}:`, err);
    }
  }));
}

/**
 * Cache the given contents as JSON strings. If caching of a record fails, it is logged & skipped.
 * @param contents mapping of CIDs to CommonContent to cache
 */
export function cacheContents(contents: Record<CID, CommonContent>) {
  const jsons: Record<CID, string> = {};
  for (let cid in contents) {
    jsons[cid] = JSON.stringify(contents[cid]);
  }
  return cache(jsons);
}

export const cacheComments    = (contents: Record<CID, CommentContent>)    => cacheContents(contents);
export const cachePosts       = (contents: Record<CID, PostContent>)       => cacheContents(contents);
export const cacheProfiles    = (contents: Record<CID, ProfileContent>)    => cacheContents(contents);
export const cacheSharedPosts = (contents: Record<CID, SharedPostContent>) => cacheContents(contents);
export const cacheSpaces      = (contents: Record<CID, SpaceContent>)      => cacheContents(contents);

function logNoCache() {
  if (!loggedNoCacheOnce) {
    console.warn('No expo-fs cacheDirectory, caching is disabled');
    loggedNoCacheOnce = true;
  }
}

var loggedNoCacheOnce = false;
