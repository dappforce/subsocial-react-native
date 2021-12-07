//////////////////////////////////////////////////////////////////////
// Import Helper(s) for Subsocial Types
export * from '@subsocial/api/flat-subsocial'
export * from '@subsocial/api/flat-subsocial/dto'
export * from '@subsocial/api/flat-subsocial/flatteners'
export * from '@subsocial/api/flat-subsocial/utils'
import { PostStruct } from './subsocial'

export type PostStructWithRoot = PostStruct & {
    rootPostId: number
}
