const util = require('./util')

class Server {
  constructor () {
    this.options = null
    this.middlewares = null
    const Koa = require('koa')
    this.app = new Koa()
    this.server = null
  }

  /**
   * @param [options] {object} - Server options
   * @param [options.port] {number} - Port
   * @param [options.hostname] {string} -The hostname (or IP address) to listen on. Defaults to 0.0.0.0.
   * @param [options.configFile] {string} - Config file, defaults to 'lws.config.js'.
   * @param [options.stack] {string[]|Features[]} - Array of feature classes, or filenames of modules exporting a feature class.
   * @param [options.moduleDir] {string[]} - One or more directories to search for feature modules.
   * @param [options.https] {boolean} - Enable HTTPS using a built-in key and cert, registered to the domain 127.0.0.1.
   * @param [options.key] {string} - SSL key. Supply along with --cert to launch a https server.
   * @param [options.cert] {string} - SSL cert. Supply along with --key to launch a https server.
   */
  launch (options) {
    this.options = options

    this.server = this.constructor.getServer(options)
    const t = require('typical')
    if (t.isDefined(options.maxConnections)) this.server.maxConnections = options.maxConnections
    if (t.isDefined(options.keepaliveTimeout)) this.server.keepAliveTimeout = options.keepaliveTimeout

    this.stack = options.stack
    if (options.view) {
      const loadModule = require('load-module')
      this.attachView(loadModule(options.view), options)
      attachServerToEventStream(this.server, options.view)
    } else {
      this.attachView(require('./cli-view'), options)
    }

    const middlewares = options.stack.getMiddlewareFunctions(options)
    middlewares.forEach(middleware => this.app.use(middleware))
    this.server.on('request', this.app.callback())

    this.server.listen(options.port, options.hostname)
    /* on server-up message */
    this.server.on('listening', () => {
      const isHttps = options.https || this.server.isHttps
      const ipList = util.getIPList()
        .map(iface => `[underline]{${isHttps ? 'https' : 'http'}://${iface.address}:${options.port}}`)
        .join(', ')
      const ansi = require('ansi-escape-sequences')
      console.error('Serving at', ansi.format(ipList))
    })

    if (this.ready) {
      this.ready()
    }
  }

  attachView (View, options) {
    const view = new View(options)
    for (const mw of this.stack) {
      mw.view = view
    }
    this.app.on('error', err => {
      view.write('koa-error', err.stack)
      util.printError(err, 'Middleware error')
    })
  }

  /**
   * Returns a listening server which processes requests using the middleware supplied.
   * @returns {Server}
   * @ignore
   */
  static getServer (options) {
    return require('http').createServer()
  }
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
  server.on('error', err => {
    view.write('server-error', err.stack)
    util.printError(err, 'Server error')
  })
  server.on('listening', write('server-listening'))
  server.on('request', write('server-request'))
  server.on('checkContinue', write('server-checkContinue'))
  server.on('checkExpectation', write('server-checkExpectation'))
  server.on('clientError', write('server-clientError'))
  server.on('connect', write('server-connect'))
  server.on('upgrade', write('server-upgrade'))
}

module.exports = Server
