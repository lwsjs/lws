const path = require('path')
const EventEmitter = require('events')

class HttpServerFactory extends EventEmitter {
  getDefaultKeyPath () {
    return path.resolve(__dirname, '..', '..', 'ssl', 'private-key.pem')
  }

  getDefaultCertPath () {
    return path.resolve(__dirname, '..', '..', 'ssl', 'lws-cert.pem')
  }

  create (options) {
    const t = require('typical')
    const serverOptions = {}
    const server = require('http').createServer()
    if (t.isDefined(options.maxConnections)) {
      server.maxConnections = serverOptions.maxConnections = options.maxConnections
    }
    if (t.isDefined(options.keepAliveTimeout)) {
      server.keepAliveTimeout = serverOptions.keepAliveTimeout = options.keepAliveTimeout
    }
    if (Object.keys(serverOptions).length) {
      this.emit('verbose', 'server.config', serverOptions)
    }
    return server
  }
}

module.exports = HttpServerFactory
