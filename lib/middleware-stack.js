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
  getMiddlewareFunctions (options) {
    return this
      .filter(mw => mw.middleware)
      .map(mw => mw.middleware(Object.assign({}, options)))
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
   * loads any paths within a feature stack
   * @param {string[]|class[]} mwModules - Array of middleware classes or modules which export them.
   * @param [options] {object}
   * @param [options.module-dir] {string[]}
   * @param [options.module-prefix] {string}
   * @return {Middleware[]}
   */
  static from (mwModules = [], options = {}) {
    const MiddlewareClasses = loadMiddlewareModules(mwModules, options)
    const stack = new this()
    for (const MiddlewareClass of MiddlewareClasses) {
      const middleware = new MiddlewareClass()
      /* extending EventEmitter is optional */
      if (middleware.on) {
        middleware.on('verbose', (key, value) => stack.emit('verbose', key, value))
      }
      stack.push(middleware)
    }
    return stack
  }
}

/**
 * loads any paths within a feature stack
 * @param [options] {object}
 * @param [options.module-dir] {string[]}
 * @param [options.module-prefix] {string}
 * @return {Middleware[]}
 */
function loadMiddlewareModules (MwModules, options) {
  return MwModules.map((MwModule, index) => {
    if (typeof MwModule === 'string') {
      return load(MwModule, options)
    } else {
      return MwModule
    }
  })
}

function load (modulePath, options) {
  const loadModule = require('load-module')
  const module = loadModule(modulePath.toLowerCase(), { prefix: options.modulePrefix, paths: options.moduleDir })
  return module
}

module.exports = MiddlewareStack
