module.exports = ServerFactory => class HttpsServerFactory extends ServerFactory {
  create (options) {
    const fs = require('fs')
    const https = require('https')
    const t = require('typical')
    const serverOptions = {}
    if (options.pfx) {
      serverOptions.pfx = fs.readFileSync(options.pfx)
    } else {
      if (!(options.key && options.cert)) {
        serverOptions.key = this.getDefaultKeyPath()
        serverOptions.cert = this.getDefaultCertPath()
      } else {
        serverOptions.key = fs.readFileSync(options.key, 'utf8')
        serverOptions.cert = fs.readFileSync(options.cert, 'utf8')
      }
    }
    if (t.isDefined(options.maxConnections)) serverOptions.maxConnections = options.maxConnections
    if (t.isDefined(options.keepAliveTimeout)) serverOptions.keepAliveTimeout = options.keepAliveTimeout
    this.emit('verbose', 'server.config', serverOptions)
    return https.createServer(serverOptions)
  }
}
