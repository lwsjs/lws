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
    this.commands.add(null, require('./command/serve'))
  }

  /**
   * Start the app.
   */
  start () {
    return this.commands.start()
  }

  static run () {
    const lws = new this()
    try {
      lws.start()
    } catch (err) {
      const util = require('./util')
      util.printError(err)
    }
  }
}

module.exports = Lws
