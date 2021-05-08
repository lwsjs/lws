import HttpFactory from './http.mjs'
import https from 'https'
import * as t from 'typical'
import fs from 'fs'

class HttpsServerFactory extends HttpFactory {
  create (options) {
    const serverOptions = {}
    if (options.pfx) {
      serverOptions.pfx = fs.readFileSync(options.pfx)
    } else {
      if (options.key && options.cert) {
        serverOptions.key = fs.readFileSync(options.key)
        serverOptions.cert = fs.readFileSync(options.cert)
      } else {
        serverOptions.key = fs.readFileSync(this.getDefaultKeyPath())
        serverOptions.cert = fs.readFileSync(this.getDefaultCertPath())
      }
    }
    const server = https.createServer(serverOptions)
    if (t.isDefined(options.maxConnections)) {
      server.maxConnections = serverOptions.maxConnections = options.maxConnections
    }
    if (t.isDefined(options.keepAliveTimeout)) {
      server.keepAliveTimeout = serverOptions.keepAliveTimeout = options.keepAliveTimeout
    }
    this.emit('verbose', 'server.config', serverOptions)
    return server
  }
}

export default HttpsServerFactory
