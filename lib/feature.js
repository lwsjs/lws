'use strict'

/**
 * Feature interface.
 */
class Feature {
  /**
   * localWebServer instance passed to constructor in case feature needs access to http server instance.
   */
  constructor (localWebServer) {}

  /**
   * Return one or more options definitions to collect command-line input
   * @returns {OptionDefinition|OptionDefinition[]}
   */
  optionDefinitions () {}

  /**
   * Return one of more middleware functions with three args (req, res and next). Can be created by express, Koa or hand-rolled.
   */
  middleware (options) {}

  ready (lws) {
    // called after server launched
  }
}

module.exports = Feature
