const util = require('util')

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
  description () {
    return '{italic <description required>}'
  }

  /**
   * Return one or more options definitions to collect command-line input.
   * @returns {OptionDefinition|OptionDefinition[]}
   */
  optionDefinitions () {}

  /**
   * Return one of more Koa middleware functions.
   * @returns {function|function[]}
   */
  middleware (options) {
    throw new Error('Middleware function not implemented')
  }

  [util.inspect.custom] (depth, options) {
    return options.stylize(this.constructor.name, 'special')
  }
}

module.exports = MiddlewarePlugin
