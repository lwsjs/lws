/**
 * MiddlewareStack plugin API.
 * @module middleware-plugin
 * @example
 * class Greeter {
 *   middleware (config) {
 *     return async (ctx, next) => {
 *       ctx.response.body = `Hello Mr ${config.surname}`
 *       await next()
 *     }
 *   }
 *
 *   optionDefinitions () {
 *     return [
 *       { name: 'surname', description: 'Your family name.' }
 *     ]
 *   }
 * }
 *
 * module.exports = Greeter
 */

/**
 * @external OptionDefinition
 * @see https://github.com/75lb/command-line-args/blob/master/doc/option-definition.md
 */

/**
 * @alias module:middleware-plugin
 */
class MiddlewarePlugin {
  /**
   * A description to show in the usage guide.
   */
  description () {}

  /**
   * Return one or more [OptionDefinition](https://github.com/75lb/command-line-args/blob/master/doc/option-definition.md) objects to collect command-line input.
   * @returns {external:OptionDefinition|external:OptionDefinition[]}
   */
  optionDefinitions () {}

  /**
   * Return one of more [Koa middleware functions](https://github.com/koajs/koa/blob/master/docs/guide.md).
   * @param {object} - The active `lws` config object.
   * @param {Lws} - The active `lws` instance. Typically, only required for access to `lws.server`.
   * @returns {function|function[]}
   */
  middleware (config, lws) {}
}

module.exports = MiddlewarePlugin
