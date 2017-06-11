const path = require('path')

class ServerFactory {
  getDefaultKey () {
    return path.resolve(__dirname, 'ssl', '127.0.0.1.key')
  }
  getDefaultCert () {
    return path.resolve(__dirname, 'ssl', '127.0.0.1.crt')
  }

  create () {
    return require('http').createServer()
  }
}

module.exports = ServerFactory
