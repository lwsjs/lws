import { loadModule } from 'load-module'

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
      return loadModule(viewPath, options)
    } else {
      return viewPath
    }
  }
}

export default View
