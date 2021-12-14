
export default class Age {
  constructor(public readonly timestamp: number) {
    
  }
  
  toString(): string {
    const diff = Date.now() - this.timestamp
    
    if (diff < 0) {
      return 'in the future'
    }
    
    if (diff < ONE_HOUR) {
      return Math.floor(diff / 60000) + 'm'
    }
    
    if (diff < ONE_DAY) {
      return Math.floor(diff / 3600000) + 'h'
    }
    
    if (diff < ONE_WEEK) {
      return Math.floor(diff / ONE_DAY) + 'd'
    }
    
    if (diff < ONE_MONTH) {
      return Math.floor(diff / ONE_WEEK) + 'w'
    }
    
    if (diff < ONE_YEAR) {
      return Math.floor(diff / ONE_MONTH) + 'M'
    }
    
    else {
      return Math.floor(diff / ONE_YEAR) + 'Y'
    }
  }
}

const ONE_HOUR  = 3600000
const ONE_DAY   = ONE_HOUR * 24
const ONE_WEEK  = ONE_DAY * 7
const ONE_MONTH = ONE_DAY * 30
const ONE_YEAR  = ONE_DAY * 365
