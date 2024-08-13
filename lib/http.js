import http from 'node:http'
import path from 'node:path'
import fs from 'fs'

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
