
export type Nullish = null | undefined

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
