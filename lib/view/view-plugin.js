/**
 * @module view-plugin
 */

/**
  * @alias module:view-plugin
  */
class View {
  /**
   * @param {string} - Event key.
   * @param {*} - Event value.
   * @param {object} - Active config.
   */
  write (key, value, config) {}

  static load (viewPath, options) {
    if (typeof viewPath === 'string') {
      const loadModule = require('load-module')
      return loadModule(viewPath, options)
    } else {
      return viewPath
    }
  }
}

module.exports = View
