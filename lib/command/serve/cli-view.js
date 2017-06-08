'use strict'
const ansi = require('ansi-escape-sequences')

class CliView {
  start (config) {
    console.error(`START: ${this.constructor.name}`)
    console.error(require('util').inspect(config, { depth: 1, colors: true }))
  }
  verbose (title, msg) {
    msg = require('util').inspect(msg, { depth: 1, colors: true })
    console.error(`${title} ${msg}`)
  }
  end () {}
  error (err) {
    const now = new Date()
    console.error(ansi.format(`[${now.toLocaleTimeString()}] ${err.message}`, 'red'))
  }
  write (name, value) {
    if (name === 'log') {
      process.stdout.write(value.trim() + '\n')
    }
  }
}

module.exports = CliView
