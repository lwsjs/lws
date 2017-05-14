'use strict'

/**
 * @module feature
 */

/**
 * Feature interface.
 * @alias module:feature
 */
class Feature {
  /**
   * localWebServer instance passed to constructor in case feature needs access to http server instance.
   * @param {Lws}
   */
  constructor (lws) {}

  /**
   * Return one or more options definitions to collect command-line input
   * @returns {OptionDefinition|OptionDefinition[]}
   */
  optionDefinitions () {}

  /**
   * Return one of more middleware functions with three args (req, res and next). Can be created by express, Koa or hand-rolled.
   * @returns {KoaMiddleware}
   */
  middleware (options) {}

  /**
   * Called once the server is launched and ready to accept connections.
   * @param {Lws}
   */
  ready (lws) {}

  static isInstance (module) {
    return module.prototype
      && (module.prototype.middleware || module.prototype.stack || module.prototype.ready || true)
  }

  /**
   * Load a module and verify it's of the correct type
   * @returns {Feature}
   */
  static load (modulePath, options) {
    const util = require('./util')
    if (this.isInstance(modulePath)) return modulePath
    const module = util.loadModule(modulePath, options)
    if (module) {
      if (!this.isInstance(module)) {
        const insp = require('util').inspect(module, { depth: 3, colors: true })
        const msg = `Not valid Middleware at: ${insp}`
        console.error(msg)
        process.exit(1)
      }
    } else {
      const msg = `No module found for: ${modulePath}`
      console.error(msg)
      process.exit(1)
    }
    return module
  }
}

module.exports = Feature
