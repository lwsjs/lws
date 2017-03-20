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
    console.error(`${title.padEnd(5)} ${msg}`)
  }
  end () {}
  error (err) {
    console.error(ansi.format(`Error: ${err.message}`, 'red'))
  }
}

module.exports = CliView

/**
 * create a nested table for deep object trees
 */
function objectToTable (object) {
  console.error(require('util').inspect(object, { depth: 6, colors: true }))
  const Table = require('table-layout')
  const t = require('typical')

  const data = Object.keys(object).map(key => {
    if (t.isPlainObject(object[key])) {
      return { key: ansi.format(key, 'bold'), value: objectToTable(object[key]) }
    } else {
      return { key: ansi.format(key, 'bold'), value: object[key] }
    }
  })
  const table = new Table(data, {
    padding: { left: '', right: ' ' },
    columns: [
      // { name: 'key', width: 18 },
      // { name: 'value', nowrap: true }
    ]
  })
  return table.toString()
}
