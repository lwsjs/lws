const EventEmitter = require('events')

/**
 *
 */
class Server extends EventEmitter {
  constructor () {
    super()
    this.options
    this.features
    this.app
    this.server
  }

  /**
   * @param [options] {object} - Server options
   * @param [options.port] {number} - Port
   * @param [options.hostname] {string} -The hostname (or IP address) to listen on. Defaults to 0.0.0.0.
   * @param [options.config-file] {string} - Config file, defaults to 'lws.config.js'.
   * @param [options.stack] {string[]|Features[]} - Array of feature classes, or filenames of modules exporting a feature class.
   * @param [options.module-dir] {string[]} - One or more directories to search for feature modules.
   * @param [options.https] {boolean} - Enable HTTPS using a built-in key and cert, registered to the domain 127.0.0.1.
   * @param [options.key] {string} - SSL key. Supply along with --cert to launch a https server.
   * @param [options.cert] {string} - SSL cert. Supply along with --key to launch a https server.
   */
  launch (options) {
    this.options = options
    this.features = options.stack.getFeatures()
    const middlewares = this.features.getMiddlewares(options)

    const Koa = require('koa')
    this.app = new Koa()
    middlewares.forEach(middleware => this.app.use(middleware))

    this.server = this.constructor.getServer(options)
    const t = require('typical')
    if (t.isDefined(options.maxConnections)) this.server.maxConnections = options.maxConnections
    if (t.isDefined(options.keepaliveTimeout)) this.server.keepAliveTimeout = options.keepaliveTimeout
    this.server.on('request', this.app.callback())
    this.server.listen(options.port, options.hostname)
    /* on server-up message */
    this.server.on('listening', () => {
      const isHttps = options.https || this.server.isHttps
      const ipList = getIPList()
        .map(iface => `[underline]{${isHttps ? 'https' : 'http'}://${iface.address}:${options.port}}`)
        .join(', ')
      const ansi = require('ansi-escape-sequences')
      console.error('Serving at', ansi.format(ipList))
    })

    this.attachView()
    if (this.ready) {
      this.ready()
    }
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

  /**
   * Returns a listening server which processes requests using the middleware supplied.
   * @returns {Server}
   * @ignore
   */
  static getServer (options) {
    const http = require('http')
    return http.createServer()
  }
}

function getSocketSet (server) {
  const socketSet = new Set()
  const byteSize = require('byte-size')
  function size (bytes) {
    const { value, unit } = byteSize(bytes)
    return `${value} ${unit}`
  }
  server.on('connection', socket => {
    socketSet.add(socket)
    socket.on('close', () => {
      socketSet.delete(socket)
    })
  })
  return socketSet
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

function attachServerToEventStream (server) {
  server.on('connection', (socket) => {
    console.error('connection', socketSet.size, socket.remoteAddress, socket.localAddress)
    socket.on('close', () => {
      server.getConnections((err, count) => console.error('socket close', count, socketSet.size))
    })
    socket.on('connect', () => {
      server.getConnections((err, count) => console.error('socket connect', count))
    })
    socket.on('data', () => {
      for (const s of socketSet) {
        console.error('stats', size(s.bytesRead), size(s.bytesWritten))
      }
    })
    socket.on('end', () => {
      server.getConnections((err, count) => console.error('socket end', count))
    })
    socket.on('lookup', () => {
      server.getConnections((err, count) => console.error('socket lookup', count))
    })
    socket.on('timeout', () => {
      server.getConnections((err, count) => console.error('socket timeout', count))
    })
  })
  server.on('close', () => console.error('close'))
  server.on('error', () => console.error('error', err))
  server.on('listening', () => console.error('listening'))
  server.on('request', () => {
    server.getConnections((err, count) => console.error('request', count))
  })
  server.on('checkContinue', () => console.error('checkContinue'))
  server.on('checkExpectation', () => console.error('checkExpectation'))
  server.on('clientError', () => console.error('clientError'))
  server.on('connect', () => console.error('connect'))
  server.on('upgrade', () => console.error('upgrade'))
}

module.exports = Server
