
export type Opt<T> = T | undefined

export type Rect = {
  top?: number
  left?: number
  right?: number
  bottom?: number
}

export type WithSize = {
  size: number
}

/** Simple wrapper for referencing primitives. */
export type Ref<T> = { value: T }
