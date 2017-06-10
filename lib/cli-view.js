'use strict'
const t = require('typical')

class CliView {
  constructor (options) {
    this.options = options
  }
  write (name, value) {
    if (this.options.verbose) {
      const output = { name }
      if (t.isDefined(value)) output.value = value
      console.log(output)
    } else {
      if (name === 'log') {
        console.log(value.trim())
      }
    }
  }
}

module.exports = CliView
