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
import store from './rtk/app/store'

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
  args?: any[] | (() => any[] | Promise<any[]>)
}
export async function send({
  api,
  tx,
  unsigned,
  args = [],
}: SendArgs): Promise<ISubmittableResult>
{
  return new Promise(async (resolve, reject) => {
    const [ pallet, method ] = tx.split('.', 2)
    const realArgs = typeof args === 'function' ? await args() : args
    
    const extrinsic = api.tx[pallet]?.[method]?.(...realArgs)
    if (!extrinsic)
      return reject(new Error(`Unknown ${pallet}/${method} extrinsic`))
    
    if (unsigned) {
      extrinsic.send(callback)
    }
    
    else {
      const keypair = selectKeypair(store.getState())
      if (!keypair)
        throw new Error('No keypair loaded')
      
      // if unloaded automatically returns -1 = auto-fetch from node
      const nonce = await store.dispatch(incClientNonce()).unwrap()
      
      extrinsic.signAndSend(keypair, { nonce }, callback)
    }
    
    function callback(result: ISubmittableResult) {
      resolve(result)
    }
  })
}

export type BuildPostArgs = (cid: string) => any[]
export type CreatePostArgs = {
  api: SubsocialApi
  content: CommentContent
  buildArgs: BuildPostArgs
}

export function createPost({ api, content, buildArgs }: CreatePostArgs) {
  const id = createTempId()
  
  return {
    tmpId: id,
    id: new Promise<PostId>(async (resolve, reject) => {
      const ipfs = api.ipfs
      const cid = await ipfs.saveComment(content)
      
      if (cid) {
        try {
          const result = await send({
            api: await api.substrate.api,
            tx: 'posts.createPost',
            args: buildArgs(cid.toString()),
          })
          
          const newId = getNewIdFromEvent(result)
          resolve(newId.toString())
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
