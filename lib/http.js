import http from 'node:http'

class HttpServer {
  create (options) {
    this.server = http.createServer(options)
    return this.server
  }

  async use (requestHandler) {
    this.server.on('request', requestHandler)
  }
}

export default HttpServer
