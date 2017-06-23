/**
 * @module lws
 */

const util = require('./util')
const t = require('typical')

/**
 * @alias module:lws
 */
class Lws {
  constructor (options) {
    this.options = options
    const View = require('./view')
    this.view = options.view || new View()

    /* validate stack */
    const Stack = require('./stack')
    if (!(options.stack instanceof Stack)) {
      options.stack = Stack.create(options.stack)
    }

    /**
     * Server instance.
     * @type {HTTPServer|HTTPSServer}
     */
    this.server = this.createServer(options)
    if (t.isDefined(options.maxConnections)) this.server.maxConnections = options.maxConnections
    if (t.isDefined(options.keepAliveTimeout)) this.server.keepAliveTimeout = options.keepAliveTimeout

    const Koa = require('koa')
    this.app = new Koa()
  }

  /**
   * Launch a server.
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
  launch () {
    this.attachView()
    const options = this.options

    /* build Koa application, add it to server */
    const middlewares = options.stack.getMiddlewareFunctions(options)
    middlewares.forEach(middleware => this.app.use(middleware))
    this.server.on('request', this.app.callback())

    /* start server */
    this.server.listen(options.port, options.hostname)

    const interval = setInterval(() => {
      const byteSize = require('byte-size')
      const memUsage = process.memoryUsage()
      memUsage.rss = byteSize(memUsage.rss).toString()
      memUsage.heapTotal = byteSize(memUsage.heapTotal).toString()
      memUsage.heapUsed = byteSize(memUsage.heapUsed).toString()
      memUsage.external = byteSize(memUsage.external).toString()
      this.view.write('process.memoryUsage', memUsage)
    }, 30000)
    interval.unref()
  }

  attachView () {
    const options = this.options

    /* attach view to middlewares */
    options.stack.attachView(this.view)

    /* attach view to Koa */
    this.app.on('error', err => {
      this.view.write('koa-error', err.stack)
      util.printError(err, 'Middleware error')
    })

    /* attach to view to server */
    attachServerToView(this.server, this.view, options)
  }

  /**
   * Returns a nodejs Server instance.
   * @returns {Server}
   * @ignore
   */
  createServer (options) {
    let ServerFactory = require('./server-factory')
    const loadModule = require('load-module')

    /* validation */
    if ((options.key && !options.cert) || (!options.key && options.cert)) {
      throw new Error('--key and --cert must always be supplied together.')
    } else if (options.https && options.pfx) {
      throw new Error('please use one of --https or --pfx, not both.')
    }

    /* create server */
    if (options.https || (options.key && options.cert) || options.pfx) {
      ServerFactory = require('./server-factory-https')(ServerFactory)
    } else if (options.server) {
      ServerFactory = loadModule(options.server)(ServerFactory)
    }
    const factory = new ServerFactory()
    factory.view = this.view
    return factory.create(options)
  }
}

function attachServerToView (server, view, options) {
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
    view.write('server.socket.new', socketProperties(socket))
    socket.on('connect', write('server.socket.connect', socketProperties(socket, cId)))
    socket.on('data', function () {
      view.write('server.socket.data', socketProperties(this))
    })
    socket.on('drain', function () {
      view.write('server.socket.drain', socketProperties(this))
    })
    socket.on('timeout', function () {
      view.write('server.socket.timeout', socketProperties(this))
    })
    socket.on('close', function () {
      view.write('server.socket.close', socketProperties(this))
    })
    socket.on('end', write('server.socket.end', socketProperties(socket, cId)))
    socket.on('lookup', write('server.socket.connect', socketProperties(socket, cId)))
  })
  server.on('close', write('server.close'))
  server.on('error', err => {
    view.write('server.error', err.stack)
    util.printError(err, 'Server error')
  })
  server.on('request', write('server.request'))
  server.on('checkContinue', write('server.checkContinue'))
  server.on('checkExpectation', write('server.checkExpectation'))
  server.on('clientError', write('server.clientError'))
  server.on('connect', write('server.connect'))
  server.on('upgrade', write('server.upgrade'))

  /* on server-up message */
  server.on('listening', () => {
    const isSecure = t.isDefined(server.addContext)
    let ipList
    if (options.hostname) {
      ipList = [ `${isSecure ? 'https' : 'http'}://${options.hostname}:${options.port}` ]
    } else {
      ipList = util.getIPList()
        .map(iface => `${isSecure ? 'https' : 'http'}://${iface.address}:${options.port}`)
    }
    view.write('server.listening', ipList)
  })
}

module.exports = Lws
