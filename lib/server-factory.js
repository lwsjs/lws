const path = require('path')

class ServerFactory {
  getDefaultKeyPath () {
    return path.resolve(__dirname, '..', 'ssl', 'private-key.pem')
  }
  getDefaultCertPath () {
    return path.resolve(__dirname, '..', 'ssl', 'lws-cert.pem')
  }

  create () {
    this.view.write('server.config', {})
    return require('http').createServer()
  }
}

module.exports = ServerFactory
