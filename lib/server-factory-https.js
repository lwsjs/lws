module.exports = ServerFactory => class HttpsServerFactory extends ServerFactory {
  create (options) {
    const fs = require('fs')
    const https = require('https')
    const serverOptions = {}
    if (options.pfx) {
      serverOptions.pfx = fs.readFileSync(options.pfx)
    } else {
      if (!(options.key && options.cert)) {
        serverOptions.key = this.getDefaultKeyPath()
        serverOptions.cert = this.getDefaultCertPath()
      }
      serverOptions.key = fs.readFileSync(serverOptions.key, 'utf8')
      serverOptions.cert = fs.readFileSync(serverOptions.cert, 'utf8')
    }
    this.emit('verbose', 'server.config', serverOptions)
    return https.createServer(serverOptions)
  }
}
