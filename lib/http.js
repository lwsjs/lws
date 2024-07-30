import http from 'node:http'
import path from 'node:path'
import fs from 'fs'
import getModulePaths from 'current-module-paths'
const __dirname = getModulePaths(import.meta.url).__dirname

class HttpServer {
  getDefaultKeyPath () {
    return path.resolve(__dirname, '..', 'ssl', 'private-key.pem')
  }

  getDefaultCertPath () {
    return path.resolve(__dirname, '..', 'ssl', 'lws-cert.pem')
  }

  getSecureServerOptions (options) {
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
    return serverOptions
  }

  create (options) {
    this.server = http.createServer(options)
    return this.server
  }

  async use (requestHandler) {
    this.server.on('request', requestHandler)
  }
}

export default HttpServer
