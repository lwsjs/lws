class Server {
  launch (options) {
    this.options = options
    const Koa = require('koa')
    this.app = new Koa()
    this.server = getServer(options)
    this.features = options.stack.getFeatures()
    this.attachView()
    const middlewares = this.features.getMiddlewares(options)
    middlewares.forEach(middleware => this.app.use(middleware))
    this.server.on('request', this.app.callback())
    this.server.listen(options.port, options.hostname)
    for (const feature of this.features) {
      if (feature.ready) {
        feature.ready(this)
      }
    }
    /* on server-up message */
    this.server.on('listening', () => {
      const ipList = getIPList()
        .map(iface => `[underline]{${this.server.isHttps ? 'https' : 'http'}://${iface.address}:${options.port}}`)
        .join(', ')
      const ansi = require('ansi-escape-sequences')
      console.error('Serving at', ansi.format(ipList))
    })
  }

  attachView () {
    const View = require('./cli-view')
    const view = new View()
    for (const feature of this.features) {
      if (feature.on) {
        feature.on('log', view.log)
        feature.on('error', view.error)
        if (this.options.verbose) {
          feature.on('start', view.start)
          feature.on('verbose', view.verbose)
        }
      }
    }
    this.server.on('error', view.error)
    this.app.on('error', view.error)
  }
}

/**
 * Returns a listening server which processes requests using the middleware supplied.
 * @returns {Server}
 * @ignore
 */
function getServer (options) {
  let key = options.key
  let cert = options.cert

  if (options.https && !(key && cert)) {
    const path = require('path')
    key = path.resolve(__dirname, 'ssl', '127.0.0.1.key')
    cert = path.resolve(__dirname, 'ssl', '127.0.0.1.crt')
  }

  let server = null
  if (key && cert) {
    const fs = require('fs')
    const serverOptions = {
      key: fs.readFileSync(key),
      cert: fs.readFileSync(cert)
    }

    const https = require('https')
    server = https.createServer(serverOptions)
    server.isHttps = true
  } else {
    const http = require('http')
    server = http.createServer()
  }

  return server
}

/**
 * Returns an array of available IPv4 network interfaces
 * @example
 * [ { address: 'mbp.local' },
 *  { address: '127.0.0.1',
 *    netmask: '255.0.0.0',
 *    family: 'IPv4',
 *    mac: '00:00:00:00:00:00',
 *    internal: true },
 *  { address: '192.168.1.86',
 *    netmask: '255.255.255.0',
 *    family: 'IPv4',
 *    mac: 'd0:a6:37:e9:86:49',
 *    internal: false } ]
 */
function getIPList () {
  const os = require('os')
  const flatten = require('reduce-flatten')

  let ipList = Object.keys(os.networkInterfaces())
    .map(key => os.networkInterfaces()[key])
    .reduce(flatten, [])
    .filter(iface => iface.family === 'IPv4')
  ipList.unshift({ address: os.hostname() })
  return ipList
}

module.exports = Server
