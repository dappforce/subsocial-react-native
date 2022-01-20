import { AxiosResponse } from 'axios'

export class BaseError extends Error {
  constructor(msg: string) {
    super(msg)
    this.name = this.constructor.name
  }
}

export class AxiosResponseError extends BaseError {
  constructor(public readonly response: AxiosResponse, public readonly msg: string = 'an unknown error occurred') {
    super(`REST API Error (status: ${response.status}): ${msg}`)
  }
}

export class StateError extends BaseError {}
