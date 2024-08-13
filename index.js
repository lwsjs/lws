import path from 'node:path'
import HttpServer from './lib/http.js'
import HttpsServer from './lib/https.js'
import Http2Server from './lib/http2.js'
import getModulePaths from 'current-module-paths'
const __dirname = getModulePaths(import.meta.url).__dirname

class Lws {
  server

  async listen (options = {}) {
    options.app = options.app || 'static'
    if (options.app === 'static') {
      options.app = path.resolve(__dirname, 'lib', 'static-app.js')
    } else {
      options.app = path.resolve(options.app)
    }
    const Application = (await import(options.app)).default
    const app = new Application()

    let server
    if (options.https) {
      server = new HttpsServer()
    } else if (options.http2) {
      server = new Http2Server()
    } else {
      server = new HttpServer()
    }
    server.create(options.server)
    server.use(app.requestHandler(options))
    server.server.listen(options.port)
    this.server = server
  }
}

export default Lws
