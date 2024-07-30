import HttpServer from './http.js'
import https from 'node:https'

class HttpsServer extends HttpServer {
  create (options = {}) {
    const serverOptions = this.getSecureServerOptions(options)
    this.server = https.createServer(serverOptions)
    return this.server
  }
}

export default HttpsServer
