/**
 * @module lws
 */

const util = require('./util')
const t = require('typical')
const EventEmitter = require('events')
const arrayify = require('array-back')
const usage = require('./usage')

/**
 * @alias module:lws
 */
class Lws extends EventEmitter {
  propagate (from) {
    from.on('verbose', (key, value) => this.emit('verbose', key, value))
  }

  /**
   * Create a listening server.
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
  create (options) {
    options = options || {}
    options.stack = arrayify(options.stack)
    usage.screen('create', options)

    /* validate stack */
    const Stack = require('./stack')
    if (!(options.stack instanceof Stack)) {
      options.stack = Stack.create(options.stack)
    }
    /* propagate stack middleware events */
    this.propagate(options.stack)

    /**
     * Server instance.
     * @type {HTTPServer|HTTPSServer}
     */
    const server = this.createServer(options)
    if (t.isDefined(options.maxConnections)) server.maxConnections = options.maxConnections
    if (t.isDefined(options.keepAliveTimeout)) server.keepAliveTimeout = options.keepAliveTimeout
    /* attach to view to server */
    createServerEventStream(server, options)
    this.propagate(server)

    /* build Koa application, add it to server */
    const Koa = require('koa')
    const app = new Koa()
    app.on('error', err => {
      this.emit('verbose', 'koa.error', err)
    })
    const middlewares = options.stack.getMiddlewareFunctions(options)
    middlewares.forEach(middleware => app.use(middleware))
    server.on('request', app.callback())

    /* start server */
    server.listen(options.port, options.hostname)

    /* emit memory usage stats every 30s */
    const interval = setInterval(() => {
      const byteSize = require('byte-size')
      const memUsage = process.memoryUsage()
      memUsage.rss = byteSize(memUsage.rss).toString()
      memUsage.heapTotal = byteSize(memUsage.heapTotal).toString()
      memUsage.heapUsed = byteSize(memUsage.heapUsed).toString()
      memUsage.external = byteSize(memUsage.external).toString()
      this.emit('verbose', 'process.memoryUsage', memUsage)
    }, 60000)
    interval.unref()

    return server
  }

  /**
   * Returns a nodejs Server instance.
   * @returns {Server}
   * @ignore
   */
  createServer (options) {
    const loadModule = require('load-module')

    /* validation */
    if ((options.key && !options.cert) || (!options.key && options.cert)) {
      throw new Error('--key and --cert must always be supplied together.')
    } else if (options.https && options.pfx) {
      throw new Error('please use one of --https or --pfx, not both.')
    }

    /* The base HTTP server factory */
    let ServerFactory = require('./server-factory')

    /* use HTTPS server factory */
    if (options.https || (options.key && options.cert) || options.pfx) {
      ServerFactory = require('./server-factory-https')(ServerFactory)

    /* use user-supplied server factory */
    } else if (options.server) {
      ServerFactory = loadModule(options.server)(ServerFactory)
    }
    const factory = new ServerFactory()
    this.propagate(factory)
    return factory.create(options)
  }
}

/**
 * Pipe server events into 'verbose' event stream
 */
function createServerEventStream (server, options) {
  function write (name, value) {
    return function () {
      server.emit('verbose', name, value)
    }
  }

  function socketProperties (socket) {
    const byteSize = require('byte-size')
    return {
      socketId: socket.id,
      bytesRead: byteSize(socket.bytesRead).toString(),
      bytesWritten: byteSize(socket.bytesWritten).toString()
    }
  }

  let cId = 1
  server.on('connection', (socket) => {
    socket.id = cId++
    write('server.socket.new', socketProperties(socket))()
    socket.on('connect', write('server.socket.connect', socketProperties(socket, cId)))
    socket.on('data', function () {
      write('server.socket.data', socketProperties(this))()
    })
    socket.on('drain', function () {
      write('server.socket.drain', socketProperties(this))()
    })
    socket.on('timeout', function () {
      write('server.socket.timeout', socketProperties(this))()
    })
    socket.on('close', function () {
      write('server.socket.close', socketProperties(this))()
    })
    socket.on('end', write('server.socket.end', socketProperties(socket, cId)))
    socket.on('lookup', write('server.socket.connect', socketProperties(socket, cId)))
  })
  server.on('close', write('server.close'))
  server.on('error', err => {
    write('server.error', err.stack)()
  })
  server.on('request', message => {
    write('server.request', {
      socketId: message.socket.id,
      method: message.method,
      url: message.url,
      headers: message.headers
    })()
  })
  server.on('checkContinue', write('server.checkContinue'))
  server.on('checkExpectation', write('server.checkExpectation'))
  server.on('clientError', (error, socket) => {
    write('server.clientError', error)()
    socket.end('HTTP/1.1 400 Bad Request\r\n\r\n')
  })
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
    write('server.listening', ipList)()
  })
}

module.exports = Lws
