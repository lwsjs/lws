class View {
  constructor (options) {
    this.options = options
    this.events = []
  }

  addEvent (evt) {
    this.events.push(evt)
  }

  write (key, value) {
    this.addEvent({key, value})
  }

  static load (viewPath) {
    if (typeof viewPath === 'string') {
      const loadModule = require('load-module')
      return loadModule(viewPath)
    }
  }
}

module.exports = View
