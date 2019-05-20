class View {
  constructor (options) {
    options = options || {}
    this.options = options
    this.events = []
    this.logError = options.logError || console.error
  }

  addEvent (evt) {
    this.events.push(evt)
  }

  write (key, value) {
    this.addEvent({ key, value })
  }

  printListeningMsg (ipList) {
    const ansi = require('ansi-escape-sequences')
    ipList = ipList
      .map(iface => ansi.format(iface, 'underline'))
      .join(', ')
    this.logError(`Serving at ${ipList}`)
  }

  static load (viewPath) {
    if (typeof viewPath === 'string') {
      const loadModule = require('load-module')
      return loadModule(viewPath, { paths: '.' })
    }
  }
}

module.exports = View
