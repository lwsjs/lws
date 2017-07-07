'use strict'

class CliView {
  constructor (options) {
    this.options = options
  }
  optionDefinitions () {
    return [
      {
        name: 'verbose.show-data',
        multiple: true,
        description: 'req, res, proxy.req, proxy.res, all'
      }
    ]
  }
  write (name, value) {
    const { printError } = require('./util')
    if (name === 'koa.error') {
      printError(value, 'Middleware error')
    } else if (name === 'server.error') {
      printError(value, 'Server error')
    } else {
      if (this.options.verbose) {
        const util = require('util')
        const output = {}
        output[name] = value
        console.log(util.inspect(output, {
          depth: 6,
          colors: true,
          maxArrayLength: null
        }))
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
