'use strict'
const ansi = require('ansi-escape-sequences')

class CliView {
  log (msg) {
    process.stdout.write(msg)
  }
  start (config) {
    // console.error(`START: ${this.constructor.name}`)
    // console.error(require('util').inspect(config, { depth: 1, colors: true }))
  }
  verbose (title, msg) {
    msg = require('util').inspect(msg, { depth: 1, colors: true })
    console.error(`${title} ${msg}`)
  }
  end () {}
  error (err) {
    console.error(ansi.format(`Error: ${err.message}`, 'red'))
  }
}

module.exports = CliView
