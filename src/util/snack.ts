import Snackbar, { SnackBarOptions } from 'react-native-snackbar'
import { delay } from './control'

export function snack(opts: SnackBarOptions) {
  Snackbar.show(opts)
}

export const delaySnack = (opts: SnackBarOptions, time: number = 100) => {
  return delay(() => snack(opts), time)
}
