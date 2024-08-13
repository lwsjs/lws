import HttpServer from './http.js'
import https from 'node:https'
import getModulePaths from 'current-module-paths'
const __dirname = getModulePaths(import.meta.url).__dirname

class HttpsServer extends HttpServer {
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

  create (options = {}) {
    const serverOptions = this.getSecureServerOptions(options)
    this.server = https.createServer(serverOptions)
    return this.server
  }
}

export default HttpsServer
