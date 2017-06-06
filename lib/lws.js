'use strict'

/**
 *Creating command-line web servers suitable for full-stack javascript development.
 * @module lws
 */

/**
 * @alias module:lws
 * @example
 * const Lws = require('lws')
 * const lws = new Lws()
 * lws.start({ https: true})
 */
class Lws {
  constructor (options) {
    const Commands = require('cli-commands')
    this.commands = new Commands()
    this.commands.add(null, require('./command/serve/serve'))
    this.commands.add('help', require('./command/help'))
    this.commands.add('show', require('./command/show'))
  }

  /**
   * Start the app.
   */
  start () {
    return this.commands.start()
  }
}

module.exports = Lws
