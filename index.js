const util = require('./lib/util')
const t = require('typical')
const EventEmitter = require('events')

/**
 * @module lws
 */

/**
 * @alias module:lws
 * @emits verbose
 */
class Lws extends EventEmitter {
  constructor () {
    super()
    /**
     * The HTTP, HTTPS or HTTP2 server.
     * @type {object}
     */
    this.server = null

    /**
     * The middleware plugin stack.
     * @type {MiddlewareStack}
     */
    this.middlewareStack = null

    /**
     * Current Koa app.
     */
    this._app = null

    /**
     * Active config.
     * @type {object}
     */
    this.config = null
  }

  listen (config = {}) {
    /* merge config */
    config = this.mergeOptions(config)
    this.config = config

    /* attach view */
    if (config.view) {
      if (typeof config.view === 'string') {
        const ViewPlugin = require('./lib/view/view-plugin')
        const ViewClass = ViewPlugin.load(config.view, {
          paths: config.moduleDir,
          prefix: config.modulePrefix
        })
        config.view = new ViewClass()
      }
      this.on('verbose', (key, value) => {
        config.view.write(key, value, config)
      })
    }

    /* create a HTTP, HTTPS or HTTP2 server */
    const server = this.createServer(config)
    this.server = server

    /* stream server events to a verbose event */
    this._createServerEventStream(server, config)

    /* attach middleware */
    this.useMiddlewareStack(server, config.stack, config)

    /* start server */
    server.listen(config.port, config.hostname)
    return server
  }

  /**
   * Get built-in defaults.
   * @returns {object}
   */
  getDefaults () {
    return {
      port: 8000,
      modulePrefix: 'lws-',
      moduleDir: [ '.' ]
    }
  }

  /**
   * Merge options with defaults and stored config.
   * @param {object}
   * @returns {object}
   */
  mergeOptions (options) {
    this.config = util.deepMerge(
      this.getDefaults(),
      util.getStoredConfig(options.configFile),
      options
    )
    return this.config
  }

  /**
   * Returns a HTTP, HTTPS or HTTP2 server instance.
   * @param [options] {object} - Server options
   * @param [options.maxConnections] {number} - The maximum number of concurrent connections supported by the server.
   * @param [options.keepAliveTimeout] {number} - The period (in milliseconds) of inactivity a connection will remain open before being destroyed. Set to `0` to keep connections open indefinitely.
   * @param [options.https] {boolean} - Enable HTTPS using a built-in key and cert registered to the domain 127.0.0.1.
   * @param [options.key] {string} - SSL key file path. Supply along with --cert to launch a https server.
   * @param [options.cert] {string} - SSL cert file path. Supply along with --key to launch a https server.
   * @param [options.pfx] {string} - Path to an PFX or PKCS12 encoded private key and certificate chain. An alternative to providing --key and --cert.
   * @param [options.ciphers] {string} - Optional cipher suite specification, replacing the default.
   * @param [options.secureProtocol] {string} - Optional SSL method to use, default is "SSLv23_method".
   * @returns {Server}
   */
  createServer (options = {}) {
    /* validation */
    if ((options.key && !options.cert) || (!options.key && options.cert)) {
      throw new Error('--key and --cert must always be supplied together.')
    } else if (options.https && options.pfx) {
      throw new Error('please use one of --https or --pfx, not both.')
    }

    /* The base HTTP server factory */
    let ServerFactory = require('./lib/server-factory/http')

    /* use HTTPS server factory */
    if (options.https || (!options.http2 && ((options.key && options.cert) || options.pfx))) {
      ServerFactory = require('./lib/server-factory/https')
    /* use HTTP2 server factory */
    } else if (options.http2) {
      ServerFactory = require('./lib/server-factory/http2')
    }
    const factory = new ServerFactory()
    util.propagate('verbose', factory, this)
    this.server = factory.create(options)
    return this.server
  }

  /**
   * Attach a Middleware stack to a running server.
   * @param server {object} - node server.
   * @param stack {string[]|Middlewares[]} - Array of middleware classes, or filenames of modules exporting a middleware class.
   * @param [options] {object} - These options plus any arbitrary options you want to expose to the middleware plugins.
   * @param [options.moduleDir] {string[]} - One or more directories to search for middleware modules.
   * @param [options.modulePrefix] {string} - An optional string to prefix to module names when loading middleware modules Defaults to 'lws-'.
   */
  useMiddlewareStack (server, stack, options = {}) {
    this.stack = this.getMiddlewareStack(stack, options)
    const middlewares = this.stack.getMiddlewareFunctions(options)
    server.on('request', this.getRequestHandler(middlewares, options))
  }

  /**
   * @param middlewares {function[]}
   * @returns {function}
   */
  getRequestHandler (middlewares = []) {
    /* build Koa application using the supplied middleware */
    const Koa = require('koa')
    const arrayify = require('array-back')
    const app = new Koa()
    app.on('error', err => {
      this.emit('verbose', 'middleware.error', err)
    })
    util.propagate('verbose', app, this)
    for (const middleware of arrayify(middlewares)) {
      app.use(middleware)
    }
    return app.callback()
  }

  /**
   * @param [options] {object} - Options.
   * @param [options.stack] {string[]|Middlewares[]} - Array of middleware classes, or filenames of modules exporting a middleware class.
   * @param [options.moduleDir] {string[]} - One or more directories to search for middleware modules.
   * @param [options.modulePrefix] {string} - An optional string to prefix to module names when loading middleware modules Defaults to 'lws-'.
   * @returns {function}
   */
  getMiddlewareStack (stack, options = {}) {
    const arrayify = require('array-back')
    stack = arrayify(stack).slice()

    /* validate stack */
    const Stack = require('./lib/middleware-stack')
    if (!(stack instanceof Stack)) {
      stack = Stack.from(stack, {
        paths: options.moduleDir,
        prefix: options.modulePrefix
      })
    }
    return stack
  }

  /* Pipe server events into 'verbose' event stream */
  _createServerEventStream (server, options) {
    const write = (name, value) => {
      return () => {
        this.emit('verbose', name, value)
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

    /* stream connection events */
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
      socket.on('error', function (err) {
        write('server.socket.error', { err })()
      })
      socket.on('end', write('server.socket.end', socketProperties(socket, cId)))
      socket.on('lookup', write('server.socket.connect', socketProperties(socket, cId)))
    })

    /* stream server events */
    server.on('close', write('server.close'))

    let requestId = 1
    server.on('request', req => {
      req.requestId = requestId++
    })

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
  }

  /**
   * Returns a listening HTTP/HTTPS/HTTP2 server.
   * @param [options] {object} - Server options
   * @param [options.port] {number} - Port
   * @param [options.hostname] {string} -The hostname (or IP address) to listen on. Defaults to 0.0.0.0.
   * @param [options.maxConnections] {number} - The maximum number of concurrent connections supported by the server.
   * @param [options.keepAliveTimeout] {number} - The period (in milliseconds) of inactivity a connection will remain open before being destroyed. Set to `0` to keep connections open indefinitely.
   * @param [options.configFile] {string} - Config file path, defaults to 'lws.config.js'.
   * @param [options.https] {boolean} - Enable HTTPS using a built-in key and cert registered to the domain 127.0.0.1.
   * @param [options.key] {string} - SSL key file path. Supply along with --cert to launch a https server.
   * @param [options.cert] {string} - SSL cert file path. Supply along with --key to launch a https server.
   * @param [options.pfx] {string} - Path to an PFX or PKCS12 encoded private key and certificate chain. An alternative to providing --key and --cert.
   * @param [options.ciphers] {string} - Optional cipher suite specification, replacing the default.
   * @param [options.secureProtocol] {string} - Optional SSL method to use, default is "SSLv23_method".
   * @param [options.stack] {string[]|Middlewares[]} - Array of middleware classes, or filenames of modules exporting a middleware class.
   * @param [options.moduleDir] {string[]} - One or more directories to search for middleware modules.
   * @param [options.modulePrefix] {string} - An optional string to prefix to module names when loading middleware modules Defaults to 'lws-'.
   * @returns {Server}
   */
  static create (options = {}) {
    const lws = new Lws()
    /* merge options */
    options = lws.mergeOptions(options)
    lws.config = options

    /* create a HTTP, HTTPS or HTTP2 server */
    const server = lws.createServer(options)
    lws.server = server

    /* stream server events to a verbose event */
    lws._createServerEventStream(server, options)

    /* attach middleware */
    lws.useMiddlewareStack(server, options.stack, options)

    /* start server */
    server.listen(options.port, options.hostname)

    return lws
  }
}

module.exports = Lws
