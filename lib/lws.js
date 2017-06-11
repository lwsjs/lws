const util = require('./util')
const t = require('typical')

class Lws {
  constructor (options) {
    this.options = options

    /* validate stack */
    const Stack = require('./stack')
    if (!(options.stack instanceof Stack)) {
      options.stack = Stack.create(options.stack)
    }

    /* create server */
    this.server = this.createServer(options)
    if (t.isDefined(options.maxConnections)) this.server.maxConnections = options.maxConnections
    if (t.isDefined(options.keepaliveTimeout)) this.server.keepAliveTimeout = options.keepaliveTimeout

    /* build Koa application, add it to server */
    const Koa = require('koa')
    this.app = new Koa()
    const middlewares = options.stack.getMiddlewareFunctions(options)
    middlewares.forEach(middleware => this.app.use(middleware))
    this.server.on('request', this.app.callback())
  }

  /**
   * Create server,
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
    const options = this.options

    /* start server */
    this.server.listen(options.port, options.hostname)
  }

  attachView () {
    const options = this.options
    /* load view */
    const View = require('./view')
    let ActiveView = View.load(options.view) || require('./cli-view')
    this.view = new ActiveView(options)

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
   * Returns a listening server which processes requests using the middleware supplied.
   * @returns {Server}
   * @ignore
   */
  createServer (options) {
    let ServerFactory = require('./server-factory')
    const loadModule = require('load-module')
    if (options.https) {
      ServerFactory = require('./server-factory-https')(ServerFactory)
    } else if (options.server) {
      ServerFactory = loadModule(options.server)(ServerFactory)
    }
    const factory = new ServerFactory()
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
  server.on('request', write('server-request'))
  server.on('checkContinue', write('server-checkContinue'))
  server.on('checkExpectation', write('server-checkExpectation'))
  server.on('clientError', write('server-clientError'))
  server.on('connect', write('server-connect'))
  server.on('upgrade', write('server-upgrade'))

  /* on server-up message */
  server.on('listening', () => {
    const isSecure = t.isDefined(server.addContext)
    const ipList = util.getIPList()
      .map(iface => `${isSecure ? 'https' : 'http'}://${iface.address}:${options.port}`)
    view.write('server-listening', ipList)
  })
}

module.exports = Lws
