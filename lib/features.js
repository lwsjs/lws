'use strict'
const flatten = require('reduce-flatten')
const ArrayBase = require('./array-base')

class Features extends ArrayBase {
  /**
   * Returns and array of middleware functions from a given stack.
   * @returns {middleware[]}
   * @ignore
   */
  getMiddlewares (options) {
    return this
      .filter(feature => feature.middleware)
      .map(feature => feature.middleware(Object.assign({}, options)))
      .reduce(flatten, [])
      .filter(mw => mw)
  }

  /**
   * Grouped 'middleware'.
   * @return {OptionDefinition[]}
   */
  getOptionDefinitions () {
    return this
      .filter(feature => feature.optionDefinitions)
      .map(feature => feature.optionDefinitions())
      .reduce(flatten, [])
      .filter(def => def)
  }
}

module.exports = Features
