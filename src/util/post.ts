import { AccountId, CommentStruct, PostId, PostStruct } from 'src/types/subsocial'

export type PostType = 'post' | 'shared' | 'comment'

export const createTempId = (): PostId => 'fake-id-' + Date.now()

export type MockStructArgs = {
  id: PostId
  address: AccountId
  type: PostType
  
  createdAtBlock?: number
  createdAtTime?: number
  hidden?: boolean
  
  repliesCount?: number
  hiddenRepliesCount?: number
  visibleRepliesCount?: number
  
  sharesCount?: number
  upvotesCount?: number
  downvotesCount?: number
  score?: number
}

export function createMockStruct({ id, address, type, ...data }: MockStructArgs): PostStruct {
  return {
    id,
    ownerId: address,
    createdByAccount: address,
    createdAtBlock: 0,
    createdAtTime: Date.now(),
    
    hidden: false,
    contentId: id,
    isRegularPost: type === 'post',
    isSharedPost: type === 'shared',
    isComment: type === 'comment',
    
    repliesCount: 0,
    hiddenRepliesCount: 0,
    visibleRepliesCount: 0,
    
    sharesCount: 0,
    upvotesCount: 0,
    downvotesCount: 0,
    score: 0,
    
    ...data,
  }
}

export const isComment = (post: PostStruct): post is CommentStruct => post.isComment
