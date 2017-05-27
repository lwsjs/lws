'use strict'
const ArrayBase = require('./array-base')

/**
 * Array of Feature classes - not instances.
 */
class Stack extends ArrayBase {
  /**
   * loads any paths within a feature stack
   * @param [options] {object}
   * @param [options.module-dir] {string[]}
   * @param [options.module-prefix] {string}
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

  getFeatures () {
    const Features = require('./features')
    const features = new Features()
    features.load(this.map(Feature => new Feature()))
    return features
  }

  static create (Features) {
    const stack = new this()
    stack.load(Features)
    return stack
  }
}

module.exports = Stack
