import HttpsServer from './https.js'
import http2 from 'node:http2'

class Http2Server extends HttpsServer {
  create (options = {}) {
    const serverOptions = this.getSecureServerOptions(options)
    this.server = http2.createSecureServer(serverOptions)
    return this.server
  }
}

export default Http2Server
