/**
 * @module middleware-plugin
 */

/**
 * Optionally you can extend EventEmitter and emit `verbose` events.
 * @alias module:middleware-plugin
 * @emits verbose
 */
class MiddlewarePlugin {
  /**
   * A description to show in the usage guide.
   */
  description () {}

  /**
   * Return one or more options definitions to collect command-line input.
   * @returns {OptionDefinition|OptionDefinition[]}
   */
  optionDefinitions () {}

  /**
   * Return one of more Koa middleware functions.
   * @params [options] {object} - A config object.
   * @returns {function|function[]}
   */
  middleware (options) {}
}

module.exports = MiddlewarePlugin
