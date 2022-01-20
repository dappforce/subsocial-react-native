import { Buffer } from 'buffer'
import { injectPromise } from 'uniprofiler/context'

// Make Buffer shim globally available
// Polkadot.js uses Buffer as built-in, not as require('buffer')
global.Buffer = Buffer
injectPromise();
