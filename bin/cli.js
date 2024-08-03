#!/usr/bin/env node
import Config from '../lib/config.js'
import tls from 'node:tls'
import Lws from 'lws'

const config = new Config()
const options = await config.combine()
process.title = options.title || 'lws'

if (options.showConfig) {
  console.log(options)
  process.exit()
}

const lws = new Lws()
await lws.listen(options)

const protocol = lws.server.server instanceof tls.Server ? 'https' : 'http'
const host = options.hostname || '127.0.0.1'
const url = `${protocol}://${host}:${options.port}`
console.log(`Listening at ${url}`)

/*
ws static <..>
ws reverse-proxy <..>
ws api <..>
*/
