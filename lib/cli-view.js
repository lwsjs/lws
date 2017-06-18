'use strict'
const t = require('typical')

class CliView {
  constructor (options) {
    this.options = options
  }
  write (name, value) {
    if (this.options.verbose) {
      const output = {}
      output[name] = value
      console.error(require('util').inspect(output, { depth: 6, colors: true }))
    } else {
      if (name === 'log') {
        console.log(value.trim())
      } else if (name === 'server-listening') {
        const ansi = require('ansi-escape-sequences')
        const ipList = value
          .map(iface => ansi.format(iface, 'underline'))
          .join(', ')
        console.error(`Serving at ${ipList}`)
      }
    }
  }
}

module.exports = CliView
