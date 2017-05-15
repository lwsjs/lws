'use strict'
const arrayify = require('array-back')
const util = require('./util')

/**
 * Array of Feature classes - not instances.
 */
class Stack extends Array {
  load (features) {
    this.clear()
    for (const feature of arrayify(features)) {
      this.push(feature)
    }
  }
  clear () {
    this.length = 0
  }

  /**
   * loads any paths within a feature stack
   * @param [options] {object}
   * @param [options.module-dir] {string[]}
   * @param [options.prefer] {string}
   * @return {Feature[]}
   */
  expand (options) {
    const Feature = require('./feature')
    this.forEach((featurePath, index) => {
      if (typeof featurePath === 'string') {
        this[index] = Feature.load(featurePath, options)
      }
    })
  }

  /**
   * Grouped 'middleware'.
   * @return {OptionDefinition[]}
   */
  getOptionDefinitions () {
    const flatten = require('reduce-flatten')
    return this
      .map(Feature => new Feature(this))
      .filter(feature => feature.optionDefinitions)
      .map(feature => feature.optionDefinitions())
      .reduce(flatten, [])
      .filter(def => def)
      .map(def => {
        def.group = 'middleware'
        return def
      })
  }

  static create (Features) {
    const stack = new this()
    stack.load(Features)
    return stack
  }
}

module.exports = Stack
