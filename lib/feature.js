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
}

module.exports = Feature
