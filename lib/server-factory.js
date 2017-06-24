const path = require('path')
const EventEmitter = require('events')

class ServerFactory extends EventEmitter {
  constructor (options) {
    super()
    options = options || {}
  }
  getDefaultKeyPath () {
    return path.resolve(__dirname, '..', 'ssl', 'private-key.pem')
  }
  getDefaultCertPath () {
    return path.resolve(__dirname, '..', 'ssl', 'lws-cert.pem')
  }

  create () {
    this.emit('verbose', 'server.config', {})
    return require('http').createServer()
  }
}

module.exports = ServerFactory
