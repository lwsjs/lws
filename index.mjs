import * as util from './lib/util.mjs'
import deepMerge from '@75lb/deep-merge'
import t from 'typical'
import EventEmitter from 'events'
import arrayify from 'array-back'
import Stack from './lib/middleware-stack.mjs'
import HttpServerFactory from './lib/server-factory/http.mjs'
import Http2ServerFactory from './lib/server-factory/http2.mjs'
import HttpsServerFactory from './lib/server-factory/https.mjs'
import Koa from 'koa'
import ViewPlugin from './lib/view/view-plugin.mjs'
import byteSize from 'byte-size'

/**
 * A lean, modular web server for rapid full-stack development.
 *
 * Lws is an application core for quickly launching a local web server. Behaviour is added via plugins giving you full control over how requests are processed and responses created.
 *
 * * Supports HTTP, HTTPS and HTTP2.
 * * Small and 100% personalisable. Load and use only the behaviour required by your project.
 * * Attach a custom view to personalise how activity is visualised.
 * * Programmatic and command-line APIs.
 *
 * @module lws
 * @example
 * // Middleware to handle requests
 * class Greeter {
 *   middleware () {
 *     return async (ctx, next) => {
 *       ctx.response.body = 'Hello!'
 *       await next()
 *     }
 *   }
 * }
 *
 * // Launch a HTTP server with the Greeter middleware attached
 * const lws = await Lws.create({ stack: Greeter })
 *
 * // $ curl http://127.0.0.1:8000
 * // Hello!
 *
 * // shutdown
 * lws.server.close()
 */

/**
 * @external LwsConfig
 * @see https://github.com/lwsjs/lws/blob/master/doc/config.md
 */

/**
 * @alias module:lws
 * @emits verbose
 */
class Lws extends EventEmitter {
  /**
   * Contructs an empty `Lws` instance but does not initialise it. Use the `Lws.create(config)` factory method to create, initialise and launch a lws server.
   * @param {external:LwsConfig} - Server config.
   */
  constructor (config) {
    super()
    /**
     * The output of Node's standard http, https or http2 `.createServer()` method. Created and set by `lws.createServer()`.
     * @type {Server}
     */
    this.server = null

    /**
     * The middleware plugin stack as defined by the config. Created and set by `lws.useMiddlewareStack()`.
     * @type {MiddlewareStack}
     */
    this.stack = null

    /**
     * The active lws config.
     * @type {external:LwsConfig}
     */
    this.config = deepMerge(
      this._getDefaultConfig(),
      config
    )
  }

  /**
   * Get built-in defaults. Overwrite this method to change the built-in defaults.
   * @returns {object}
   * @ignore
   */
  _getDefaultConfig () {
    return {
      port: 8000,
      moduleDir: [process.cwd()]
    }
  }

  /**
   * Merge supplied config with defaults and stored config.
   * @param {external:LwsConfig}
   * @ignore
   */
  async loadStoredConfig () {
    const config = await util.getStoredConfig(this.config.configFile)
    this.config = deepMerge(
      this.config,
      config
    )
  }

  /**
   * Sets the middleware stack, loading plugins if supplied.
   * @ignore
   */
  async _setStack () {
    let stack = this.config.stack

    /* convert stack to type MiddlewareStack */
    if (!(stack instanceof Stack)) {
      stack = arrayify(this.config.stack).slice()
      stack = await Stack.from(stack, {
        paths: this.config.moduleDir
      })
    }
    util.propagate('verbose', stack, this)
    this.stack = stack
  }

  /**
   * Create a HTTP, HTTPS or HTTP2 server, depending on config. Returns the output of Node's standard http, https or http2 `.createServer()` method also assigning it to `lws.server`.
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
    let ServerFactory = HttpServerFactory

    /* use HTTPS server factory */
    if (options.https || (!options.http2 && ((options.key && options.cert) || options.pfx))) {
      ServerFactory = HttpsServerFactory
    /* use HTTP2 server factory */
    } else if (options.http2) {
      ServerFactory = Http2ServerFactory
    }

    const factory = new ServerFactory()
    util.propagate('verbose', factory, this)
    this.server = factory.create(options)
    return this.server
  }

  /**
   * Attach the Middleware stack to the server. Must be run after `lws.createServer()`.
   */
  async useMiddlewareStack () {
    if (!this.server) throw new Error('Create server first')
    await this._setStack()
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
    const app = new Koa()
    app.on('error', err => {
      /**
       * An event stream of debug information.
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
        const ViewClass = ViewPlugin.load(config.view, {
          paths: config.moduleDir
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

    const server = this.server
    server.on('connection', socket => {
      /* socket events */
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
        this.emit('verbose', 'server.socket.error', err)
      })
    })

    server.on('close', () => {
      this.emit('verbose', 'server.close')
    })

    /* on server-up message */
    server.on('listening', () => {
      const isSecure = t.isDefined(server.addContext)
      const ipList = util.getIPList(this.config.hostname)
      for (const i of ipList) {
        i.url = `${isSecure ? 'https' : 'http'}://${i.address}:${this.config.port}`
      }
      this.emit('verbose', 'server.listening', ipList)
    })

    server.on('error', err => {
      this.emit('verbose', 'server.error', err)
    })
  }

  /**
   * Launch a listening HTTP, HTTPS or HTTP2 server configured as specified by the supplied config.
   * @param config {external:LwsConfig}
   * @returns {Lws}
   */
  static async create (config) {
    const lws = new this(config)
    await lws.loadStoredConfig()

    /* attach the view */
    lws.useView()

    /* create a HTTP, HTTPS or HTTP2 server */
    lws.createServer()

    /* forward server events to the verbose event */
    lws._propagateServerEvents()

    /* attach middleware */
    await lws.useMiddlewareStack()

    /* start server */
    lws.server.listen(lws.config.port, lws.config.hostname)

    return lws
  }
}

export default Lws
