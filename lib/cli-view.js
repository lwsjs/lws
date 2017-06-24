'use strict'
const t = require('typical')

class CliView {
  constructor (options) {
    this.options = options
  }
  write (name, value) {
    const util = require('./util')
    if (name === 'koa.error') {
      util.printError(value.stack, 'Middleware error')
    } else if (name === 'server.error') {
      util.printError(value.stack, 'Server error')
    } else {
      if (this.options.verbose) {
        const output = {}
        output[name] = value
        console.log(require('util').inspect(output, { depth: 6, colors: true }))
      } else {
        if (name === 'server.listening') {
          const ansi = require('ansi-escape-sequences')
          const ipList = value
            .map(iface => ansi.format(iface, 'underline'))
            .join(', ')
          console.error(`Serving at ${ipList}`)
        }
      }
    }
  }
}

module.exports = CliView
