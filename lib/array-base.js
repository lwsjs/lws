'use strict'

class ArrayBase extends Array {
  load (items) {
    const arrayify = require('array-back')
    this.clear()
    for (const item of arrayify(items)) {
      this.push(item)
    }
  }
  clear () {
    this.length = 0
  }
}

module.exports = ArrayBase
