#!/usr/bin/env node
import Config from '../lib/config.js'
import tls from 'node:tls'
import os from 'node:os'
import Lws from 'lws'

const config = new Config()
const optionsSet = await config.combine()

function getIPList (boundHostname) {
  const output = []
  output.push({ name: 'hostname', address: boundHostname || os.hostname() })
  if (!boundHostname) {
    const networkInterfaces = os.networkInterfaces()
    for (const name of Object.keys(networkInterfaces)) {
      for (const i of networkInterfaces[name]) {
        if (i.family === 'IPv4' || i.family === 4) {
          output.push({
            name,
            address: i.address
          })
        }
      }
    }
  }
  return output
}

function printNetworkInterfaces (hostname) {
  const ipList = getIPList(hostname)
  // const interfaces = ipList.map(iface => `- ${ansi.format(iface.name, 'bold')}: ${iface.address}`).join('\n')
  const interfaces = ipList.map(iface => `- ${iface.name}: ${iface.address}`).join('\n')
  // this.log(`\n${ansi.format('Available network interfaces:', 'underline')}\n${interfaces}\n`)
  console.log(interfaces)
}

for (const options of optionsSet) {
  process.title = options.title || 'lws'

  if (options.showConfig) {
    console.log(options)
    process.exit()
  } else if (options.help) {
    console.log('lws server [-h|--help] [--app <path>] [-p|--port <number>] [--hostname <string>] [--https] [--http2] [--config <path>] [--show-config] [--title <string>] [--morgan.format.string <string>] [--static.root.string <string>] [--custom.404.string <string>] [--spa.index.string <string>]')
    process.exit()
  }

  const lws = new Lws()
  await lws.listen(options)

  const protocol = lws.server.server instanceof tls.Server ? 'https' : 'http'
  const host = options.hostname || '127.0.0.1'
  const url = `${protocol}://${host}:${options.port}`
  console.log(`Listening at ${url}`)
  printNetworkInterfaces(options.hostname)
}

/*
ws static <..>
ws reverse-proxy <..>
ws api <..>
or
ws server --app static
ws server --app reverse-proxy
*/
