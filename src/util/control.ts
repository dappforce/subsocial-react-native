
/** Simple wrapper around Promise to create try/catch/then/finally syntax */
export function trial<T>(cb: () => T | Promise<T>) {
  return new Promise<T>(async (res, rej) => {
    try {
      res(await cb())
    }
    catch (err) {
      rej(err)
    }
  })
}

export function delay<T=void>(cb: (delta: number) => T | Promise<T>, time: number = 100) {
  return new Promise<T>(async (res, rej) => {
    const t0 = Date.now()
    setTimeout(async () => {
      try {
        res(await cb(Date.now()-t0))
      }
      catch (err) {
        rej(err)
      }
    }, time)
  })
}

export function DelegatePromise<T>() {
  let resolve: (value: T | PromiseLike<T>) => void = () => {}
  let reject: (reason?: any) => void = () => {}
  let promise = new Promise<T>((res, rej) => {
    resolve = res
    reject = rej
  })
  return {
    resolve,
    reject,
    promise,
  }
}
