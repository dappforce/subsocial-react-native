//////////////////////////////////////////////////////////////////////
// Mini wrapper library for Substrate tx's
import { ApiPromise } from '@polkadot/api'
import { SubmittableExtrinsic } from '@polkadot/api/types'
import { ISubmittableResult } from '@polkadot/types/types'
import { SubsocialApi } from '@subsocial/api'
import { Comment, IpfsContent, OptionId, PostExtension } from '@subsocial/types/substrate/classes'
import { PostId as SubstratePostId } from '@subsocial/types/substrate/interfaces'
import { CommentContent, PostId, PostStruct } from './types/subsocial'
import { incClientNonce, selectKeypair } from './rtk/features/accounts/localAccountSlice'
import { createTempId, isComment } from './util/post'
import { asBn, getNewIdFromEvent } from './util/substrate'
import { logger as createLogger } from '@polkadot/util'
import type { AppDispatch, AppStore } from './rtk/app/store'
import type { Opt } from './types'

const log = createLogger('tx')

export type Extrinsic = SubmittableExtrinsic<'promise', ISubmittableResult>

export class UnknownExtrinsicError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'UnknownExtrinsicError'
  }
}

export class NoKeypairError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'NoKeypairError'
  }
}

export type SendArgs = {
  api: ApiPromise
  tx: string
  unsigned?: boolean
  store: AppStore
  args?: any[] | (() => any[] | Promise<any[]>)
  onResult?: (result: ISubmittableResult) => void
  onSuccess?: (result: ISubmittableResult) => void
  onFailure?: (result: ISubmittableResult | Error) => void
}
export async function send({
  api,
  tx,
  unsigned,
  store,
  args = [],
  onResult,
  onSuccess,
  onFailure,
}: SendArgs): Promise<ISubmittableResult>
{
  return new Promise(async (resolve, reject) => {
    let unsub = () => {}
    const [ pallet, method ] = tx.split('.', 2)
    const realArgs = typeof args === 'function' ? await args() : args
    
    const callback = handleSendResult.bind(null, {
      onResult,
      onSuccess: (result) => {
        unsub()
        onSuccess?.(result)
        resolve(result)
      },
      onFailure: (result) => {
        unsub()
        onFailure?.(result)
        reject(result)
      },
    })
    
    const extrinsic = api.tx[pallet]?.[method]?.(...realArgs)
    if (!extrinsic)
      return reject(new Error(`Unknown ${pallet}/${method} extrinsic`))
    
    if (unsigned) {
      unsub = await extrinsic.send(callback)
    }
    else {
      const keypair = selectKeypair(store.getState())
      if (!keypair)
        throw new Error('No keypair loaded')
      
      // if unloaded automatically returns -1 = auto-fetch from node
      const nonce = await store.dispatch(incClientNonce()).unwrap()
      
      unsub = await extrinsic.signAndSend(keypair, { nonce }, callback)
    }
  })
}

type HandleSendResultArgs = {
  onResult?: (result: ISubmittableResult) => void
  onSuccess: (result: ISubmittableResult) => void
  onFailure: (result: ISubmittableResult | Error) => void
}
function handleSendResult({
  onResult,
  onSuccess,
  onFailure,
}: HandleSendResultArgs, result: ISubmittableResult) {
  onResult?.(result)
  
  if (!result?.status) return
  
  if (result.isError) {
    return onFailure(result)
  }
  
  const { status } = result
  
  if (status.isInBlock || status.isFinalized) {
    const blockHash = status.isFinalized ? status.asFinalized : status.asInBlock
    const resolution = resolveSubmittableResult(result)
    
    log.debug(`✔️ TX finalized/in block at hash ${blockHash.toString()}`)
    
    if (resolution === undefined) {
      onFailure(new Error(`No Extrinsic result in TX ${blockHash.toString()}`))
      return
    }
    
    if (resolution) {
      onSuccess(result)
    }
    else {
      onFailure(result)
    }
  }
  else {
    log.debug(`⏱ TX status: ${status.type}`)
  }
}

function resolveSubmittableResult(result: ISubmittableResult): Opt<boolean> {
  let resolution: Opt<boolean> = undefined
  function setResolution(value: boolean) {
    if (resolution !== undefined)
      log.warn(`Multiple Extrinsic resolutions detected, it is now ${value}`)
    resolution = value
  }
  
  result.events
    .filter(({ event: { section }}) => section === 'system')
    .forEach(({ event: { method }}) => {
      if (method === 'ExtrinsicSuccess') {
        setResolution(true)
      }
      else if (method === 'ExtrinsicFailed') {
        setResolution(false)
      }
    })
  
  return resolution
}


export type BuildPostArgs = (cid: string) => any[]
export type CreatePostArgs = {
  api: SubsocialApi
  store: AppStore
  content: CommentContent
  buildArgs: BuildPostArgs
}

export function createPost({ api, store, content, buildArgs }: CreatePostArgs) {
  const id = createTempId()
  
  return {
    tmpId: id,
    id: new Promise<PostId>(async (resolve, reject) => {
      const ipfs = api.ipfs
      const cid = await ipfs.saveComment(content)
      
      if (cid) {
        try {
          await send({
            api: await api.substrate.api,
            store,
            tx: 'posts.createPost',
            args: buildArgs(cid.toString()),
            onSuccess: (result) => {
              const bnid = getNewIdFromEvent(result)
              if (!bnid)
                return reject(new Error(`Failed to extract new PostId from event`))
              resolve(bnid.toString())
            },
            onFailure: (result) => {
              reject(result)
            },
          })
        }
        catch (err) {
          log.error(`Transaction failed: ${err}`)
          ipfs.removeContent(cid).then(err => log.error(`Error while unpinning CID ${cid}: ${err}`))
          reject(err)
        }
      }
      
      else {
        log.error('ipfs.saveComment returned undefined CID')
        reject(new Error('ipfs.saveComment returned undefined CID'))
      }
    })
  }
}

export type CreateCommentArgs = Omit<CreatePostArgs, 'buildArgs'> & {
  parent: PostStruct
}

export function createComment({ parent, ...args }: CreateCommentArgs) {
  return createPost({
    ...args,
    buildArgs: cid => [ new OptionId(), createCommentExt(parent), new IpfsContent(cid) ],
  })
}

function createCommentExt(parent: PostStruct): PostExtension {
  if (isComment(parent)) {
    return new PostExtension({
      Comment: new Comment({
        parent_id: new OptionId(asBn(parent.id)),
        root_post_id: asBn(parent.rootPostId) as SubstratePostId,
      })
    })
  }
  
  else {
    return new PostExtension({
      Comment: new Comment({
        parent_id: new OptionId(),
        root_post_id: asBn(parent.id) as SubstratePostId,
      })
    })
  }
}
