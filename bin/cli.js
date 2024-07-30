#!/usr/bin/env node
import Config from '../lib/config.js'
import HttpServer from '../lib/http.js'
import HttpsServer from '../lib/https.js'
import Http2Server from '../lib/http2.js'
import tls from 'node:tls'

const config = new Config()
const options = await config.combine()

if (options.showConfig) {
  console.log(options)
  process.exit()
}

const Application = (await import(options.app || '../lib/static-app.js')).default
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

const protocol = server.server instanceof tls.Server ? 'https' : 'http'
const host = options.hostname || '127.0.0.1'
const url = `${protocol}://${host}:${options.port}`
console.log(`Listening at ${url}`)

/*
ws static <..>
ws reverse-proxy <..>
ws api <..>
*/
