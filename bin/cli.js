#!/usr/bin/env node
import Config from '../lib/config.js'
import tls from 'node:tls'
import Lws from 'lws'

const config = new Config()
const optionsSet = await config.combine()
// console.log(optionsSet)
// process.exit()

for (const options of optionsSet) {
  process.title = options.title || 'lws'

  if (options.showConfig) {
    console.log(options)
    process.exit()
  } else if (options.help || options._args.length) {
    console.log('lws server [-h|--help] [--app <path>] [--port <number>] [--hostname <string>] [--https] [--http2] [--config <path>] [--show-config] [--title <string>]')
    process.exit()
  }

  const lws = new Lws()
  await lws.listen(options)

  const protocol = lws.server.server instanceof tls.Server ? 'https' : 'http'
  const host = options.hostname || '127.0.0.1'
  const url = `${protocol}://${host}:${options.port}`
  console.log(`Listening at ${url}`)
}

/*
ws static <..>
ws reverse-proxy <..>
ws api <..>
or
ws server --app static
ws server --app reverse-proxy
*/
