class View {
  constructor (options) {
    this.options = options
  }

  write (key, value) {}

  static load (viewPath) {
    if (typeof viewPath === 'string') {
      const loadModule = require('load-module')
      return loadModule(options.view)
    }
  }
}

module.exports = View
