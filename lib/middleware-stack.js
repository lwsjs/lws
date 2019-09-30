const flatten = require('reduce-flatten')
const EventEmitter = require('events')
const mixInto = require('create-mixin')

/**
 * Array of Middleware instances
 * @module stack
 */

class MiddlewareStack extends mixInto(EventEmitter)(Array) {
  /**
   * Returns an array of middleware functions
   * @returns {function[]}
   */
  getMiddlewareFunctions (config, lws) {
    return this
      .filter(mw => mw.middleware)
      .map(mw => mw.middleware(Object.assign({}, config), lws))
      .reduce(flatten, [])
      .filter(mw => mw)
  }

  /**
   * @return {OptionDefinition[]}
   */
  getOptionDefinitions () {
    return this
      .filter(mw => mw.optionDefinitions)
      .map(mw => mw.optionDefinitions())
      .reduce(flatten, [])
      .filter(def => def)
  }

  /**
   * @param {string[]|class[]} modules - Array of middleware classes or modules which export them.
   * @param [options] {object}
   * @param [options.paths] {string[]}
   * @param [options.prefix] {string}
   * @return {Middleware[]}
   */
  static from (modules = [], options) {
    const MiddlewareClasses = modules.map((moduleItem, index) => {
      /* load module */
      if (typeof moduleItem === 'string') {
        const loadModule = require('load-module')
        moduleItem = loadModule(moduleItem, options)
      }
      /* validate module */
      if (typeof moduleItem === 'function' && moduleItem.prototype.middleware) {
        return moduleItem
      } else {
        throw new Error('Invalid middleware: please supply a class with a `middleware` method.')
      }
    })
    const stack = new this()
    for (const MiddlewareClass of MiddlewareClasses) {
      const middleware = new MiddlewareClass()
      stack.push(middleware)
      /* extending EventEmitter is optional */
      if (middleware.on) {
        middleware.on('verbose', (key, value) => stack.emit('verbose', key, value))
      }
    }
    return stack
  }
}

module.exports = MiddlewareStack
