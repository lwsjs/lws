'use strict'
const ArrayBase = require('array-base')
const flatten = require('reduce-flatten')

/**
 * Array of Middleware instances
 */
class Stack extends ArrayBase {
  /**
   * Returns and array of middleware functions
   * @returns {middleware[]}
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

  static create (MwModules = [], options) {
    const stack = new this()
    loadMiddlewareModules(MwModules, options)
    stack.load(MwModules.map(MwModule => new MwModule()))
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
  const Middleware = require('./middleware')
  MwModules.forEach((MwModule, index) => {
    if (typeof MwModule === 'string') {
      MwModules[index] = Middleware.load(MwModule, options)
    }
  })
}

module.exports = Stack
