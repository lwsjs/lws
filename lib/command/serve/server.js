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

    const Koa = require('koa')
    this.app = new Koa()
    this.server = this.constructor.getServer(options)

    this.features = options.stack.getFeatures()
    if (options.view) {
      const loadModule = require('load-module')
      this.attachView(loadModule(options.view))
    } else {
      this.attachView(require('./cli-view'))
    }

    const middlewares = this.features.getMiddlewares(options)
    middlewares.forEach(middleware => this.app.use(middleware))

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

    if (this.ready) {
      this.ready()
    }

    attachServerToEventStream(this.server, this.view)
  }

  attachView (View) {
    const view = new View()
    const ansi = require('ansi-escape-sequences')
    this.view = view
    for (const feature of this.features) {
      feature.view = view
    }
    this.server.on('error', err => {
      view.write('server-error', err.stack)
      const now = new Date()
      const time = now.toLocaleTimeString()
      console.error(ansi.format(`${time}: [underline red]{Server error}\n[red]{${err.stack}}`))
    })
    this.app.on('error', err => {
      view.write('koa-error', err.stack)
      const now = new Date()
      const time = now.toLocaleTimeString()
      console.error(ansi.format(`${time}: [underline red]{Middleware error}`))
      console.error(ansi.format(`[red]{${err.message}}`))
    })
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

function attachServerToEventStream (server, view) {
  function write (name, value) {
    return function () {
      view.write(name, value)
    }
  }

  function socketProperties (socket) {
    return {
      id: socket.id,
      bytesRead: socket.bytesRead,
      bytesWritten: socket.bytesWritten
    }
  }

  let cId = 1
  server.on('connection', (socket) => {
    socket.id = cId++
    view.write('socket-new', socketProperties(socket))
    socket.on('connect', write('socket-connect', socketProperties(socket, cId)))
    socket.on('data', function () {
      view.write('socket-data', socketProperties(this))
    })
    socket.on('drain', function () {
      view.write('socket-drain', socketProperties(this))
    })
    socket.on('timeout', function () {
      view.write('socket-timeout', socketProperties(this))
    })
    socket.on('close', function () {
      view.write('socket-close', socketProperties(this))
    })
    socket.on('end', write('socket-end', socketProperties(socket, cId)))
    socket.on('lookup', write('socket-connect', socketProperties(socket, cId)))
  })
  server.on('close', write('server-close'))
  server.on('error', err => view.write('server-error', err))
  server.on('listening', write('server-listening'))
  server.on('request', write('server-request'))
  server.on('checkContinue', write('server-checkContinue'))
  server.on('checkExpectation', write('server-checkExpectation'))
  server.on('clientError', write('server-clientError'))
  server.on('connect', write('server-connect'))
  server.on('upgrade', write('server-upgrade'))
}

module.exports = Server
