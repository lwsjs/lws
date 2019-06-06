const util = require('./lib/util')
const t = require('typical')
const EventEmitter = require('events')

/**
 * An application shell for building a modular HTTP, HTTPS or HTTP2 local web server.
 * @module lws
 */

/**
 * @alias module:lws
 * @emits verbose
 */
class Lws extends EventEmitter {
  /**
    * @param {LwsConfig} - Server config.
    */
  constructor (config) {
    super()
    /**
     * The HTTP, HTTPS or HTTP2 server.
     * @type {Server}
     */
    this.server = null

    /**
     * The middleware plugin stack.
     * @type {MiddlewareStack}
     */
    this.stack = null

    /**
     * Active config.
     * @type {LwsConfig}
     */
    this.config = null

    this._setConfig(config)
  }

  /**
   * Get built-in defaults. Overwrite this method to change the built-in defaults.
   * @returns {object}
   * @ignore
   */
  _getDefaultConfig () {
    return {
      port: 8000,
      modulePrefix: 'lws-',
      moduleDir: [ '.' ]
    }
  }

  /**
   * Merge supplied config with defaults and stored config.
   * @param {object}
   * @returns {object}
   * @ignore
   */
  _setConfig (config = {}) {
    this.config = util.deepMerge(
      this._getDefaultConfig(),
      util.getStoredConfig(config.configFile),
      config
    )
  }

  /**
   * Sets the middleware stack, loading plugins if supplied.
   * @ignore
   */
  _setStack () {
    const arrayify = require('array-back')
    const Stack = require('./lib/middleware-stack')
    let stack = this.config.stack

    /* convert stack to type MiddlewareStack */
    if (!(stack instanceof Stack)) {
      stack = arrayify(this.config.stack).slice()
      stack = Stack.from(stack, {
        paths: this.config.moduleDir,
        prefix: this.config.modulePrefix
      })
    }
    util.propagate('verbose', stack, this)
    this.stack = stack
  }

  /**
   * Create a HTTP, HTTPS or HTTP2 server, depending on config. Returns the output of Node's standard http, https or http2 `.createServer()` method.
   * @returns {Server}
   */
  createServer () {
    if (this.server) throw new Error('server already created')
    const options = this.config

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
   * Attach the Middleware stack to the server.
   */
  useMiddlewareStack () {
    if (!this.server) throw new Error('Create server first')
    this._setStack()
    const middlewares = this.stack.getMiddlewareFunctions(this.config, this)
    this.server.on('request', this._getRequestHandler(middlewares))
  }

  /**
   * Override this method to use a means other than Koa to handle requests.
   * @param middlewares {function[]}
   * @returns {function}
   * @ignore
   */
  _getRequestHandler (middlewares = []) {
    /* build Koa application using the supplied middleware */
    const Koa = require('koa')
    const arrayify = require('array-back')
    const app = new Koa()
    app.on('error', err => {
      /**
       * Highly-verbose debug information event stream.
       *
       * @event module:lws#verbose
       * @param key {string} - An identifying string, e.g. `server.socket.data`.
       * @param value {*} - The value, e.g. `{ socketId: 1, bytesRead: '3 Kb' }`.
       */
      this.emit('verbose', 'middleware.error', err)
    })
    util.propagate('verbose', app, this)
    for (const middleware of arrayify(middlewares)) {
      app.use(middleware)
    }
    return app.callback()
  }

  /**
   * Attach the view specified in the config.
   */
  useView () {
    const config = this.config
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
  }

  /* Pipe server events into 'verbose' event stream */
  _propagateServerEvents () {
    function socketProperties (socket) {
      const byteSize = require('byte-size')
      const output = {
        bytesRead: byteSize(socket.bytesRead).toString(),
        bytesWritten: byteSize(socket.bytesWritten).toString(),
        remoteAddress: socket.remoteAddress
      }
      if (socket.bufferSize) {
        output.bufferSize = byteSize(socket.bufferSize).toString()
      }
      return output
    }

    /* stream connection events */
    const server = this.server
    server.on('connection', socket => {
      this.emit('verbose', 'server.socket.new', socketProperties(socket))
      socket.on('connect', () => {
        this.emit('verbose', 'server.socket.connect', socketProperties(socket))
      })
      socket.on('data', () => {
        this.emit('verbose', 'server.socket.data', socketProperties(socket))
      })
      socket.on('drain', () => {
        this.emit('verbose', 'server.socket.drain', socketProperties(socket))
      })
      socket.on('timeout', () => {
        this.emit('verbose', 'server.socket.timeout', socketProperties(socket))
      })
      socket.on('close', () => {
        this.emit('verbose', 'server.socket.close', socketProperties(socket))
      })
      socket.on('end', () => {
        this.emit('verbose', 'server.socket.end', socketProperties(socket))
      })
      socket.on('error', function (err) {
        this.emit('verbose', 'server.socket.error', { err })
      })
    })

    server.on('close', () => {
      this.emit('verbose', 'server.close')
    })

    /* on server-up message */
    server.on('listening', () => {
      const isSecure = t.isDefined(server.addContext)
      let ipList
      if (this.config.hostname) {
        ipList = [ `${isSecure ? 'https' : 'http'}://${this.config.hostname}:${this.config.port}` ]
      } else {
        ipList = util.getIPList()
          .map(iface => `${isSecure ? 'https' : 'http'}://${iface.address}:${this.config.port}`)
      }
      this.emit('verbose', 'server.listening', ipList)
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
   * Launch a listening HTTP, HTTPS or HTTP2 configured as specified.
   * @param config {LwsConfig}
   * @returns {Lws}
   */
  static create (config) {
    const lws = new this(config)

    /* attach the view */
    lws.useView()

    /* create a HTTP, HTTPS or HTTP2 server */
    lws.createServer()

    /* stream server events to a verbose event */
    lws._propagateServerEvents()

    /* attach middleware */
    lws.useMiddlewareStack()

    /* start server */
    lws.server.listen(lws.config.port, lws.config.hostname)

    return lws
  }
}

module.exports = Lws
