import * as t from 'typical'
import fs from 'fs'
import HttpFactory from './http.mjs'
import http2 from 'http2'

class Http2ServerFactory extends HttpFactory {
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
    if (t.isDefined(options.maxConnections)) throw new Error('--max-connections has no effect with http2')
    if (t.isDefined(options.keepAliveTimeout)) throw new Error('--keep-alive-timeout has no effect with http2')
    if (Object.keys(serverOptions).length) {
      this.emit('verbose', 'server.config', serverOptions)
    }
    return http2.createSecureServer(serverOptions)
  }
}

export default Http2ServerFactory
