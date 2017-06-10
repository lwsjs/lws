'use strict'

/**
 * @module middleware
 */

/**
 * @alias module:middleware
 */
class Middleware {
  constructor () {
    this.view = null
  }

  /**
   * Return one or more options definitions to collect command-line input
   * @returns {OptionDefinition|OptionDefinition[]}
   */
  optionDefinitions () {}

  /**
   * Return one of more Koa middleware functions.
   * @returns {KoaMiddleware}
   */
  middleware (options) {}

  static isInstance (module) {
    return module.prototype && module.prototype.middleware
  }

  /**
   * Load a module and verify it's of the correct type
   * @returns {Middleware}
   */
  static load (modulePath, options) {
    const loadModule = require('load-module')
    if (this.isInstance(modulePath)) return modulePath
    const module = loadModule(modulePath, options)
    if (module && !this.isInstance(module)) {
      const insp = require('util').inspect(module, { depth: 3, colors: true })
      const msg = `Not valid Middleware at: ${modulePath}`
      throw new Error(msg)
    }
    return module
  }
}

module.exports = Middleware
