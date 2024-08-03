import HttpServer from './lib/http.js'
import HttpsServer from './lib/https.js'
import Http2Server from './lib/http2.js'

class Lws {
  server

  async listen (options = {}) {
    const Application = (await import(options.app || './lib/static-app.js')).default
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
