import { hexToU8a, isHex } from '@polkadot/util'
import { decodeAddress, encodeAddress, naclSign, naclVerify, randomAsU8a } from '@polkadot/util-crypto'

// see https://polkadot.js.org/docs/util-crypto/examples/validate-address/
export function validateAddress(address: string): boolean {
  try {
    encodeAddress(isHex(address) ? hexToU8a(address) : decodeAddress(address))
    return true
  }
  catch {
    return false
  }
}

export function validateKeypair(secret: string, address: string): boolean {
  const msg = randomAsU8a()
  const publicKey = isHex(address) ? hexToU8a(address) : decodeAddress(address)
  const secretKey = hexToU8a(secret)
  
  const sig = naclSign(msg, { secretKey })
  return naclVerify(msg, sig, publicKey)
}
