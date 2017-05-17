'use strict'
const path = require('path')
const arrayify = require('array-back')
const ansi = require('ansi-escape-sequences')
const util = require('./util')
const Stack = require('./stack')

/**
 *Creating command-line web servers suitable for full-stack javascript development.
 * @module lws
 */

/**
 * @alias module:lws
 * @example
 * const Lws = require('lws')
 * const lws = new Lws()
 * lws.start({ https: true})
 */
class Lws {
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
  constructor (options) {
    const builtInDefaults = {
      port: 8000
    }
    this.internalOptions = Object.assign({}, builtInDefaults, options)
    this.internalOptions['module-dir'] = arrayify(this.internalOptions['module-dir'])

    /**
     * The [Koa application](https://github.com/koajs/koa/blob/master/docs/api/index.md#application) instance in use.
     * @type {Koa}
     */
    this.app = null

    /**
     * The node server in use, an instance of either [http.Server](https://nodejs.org/dist/latest-v7.x/docs/api/http.html#http_class_http_server) or [https.Server](https://nodejs.org/dist/latest-v7.x/docs/api/https.html#https_class_https_server).
     * @type {http.Server|https.Server}
     */
    this.server = null

    /**
     * Feature instances
     * @type {Feature[]}
     */
    this.features = null
  }

  /**
   * Start the app.
   */
  start () {
    /* first read of command-line options */
    const commandLineArgs = require('command-line-args')
    const internalDefinitions = require('./cli-data').optionDefinitions
    let cliOptions = commandLineArgs(internalDefinitions, { partial: true })

    let options = util.deepMerge({}, this.internalOptions, cliOptions._all)

    /* load specified config file */
    const storedOptions = getStoredConfig(options['config-file'])
    options = util.deepMerge({}, this.internalOptions, storedOptions, cliOptions._all)

    /* establish the feature stack */
    const stack = Stack.create(cliOptions._all.stack || storedOptions.stack || this.internalOptions.stack)
    stack.expand(options)

    /* now we have the stack, get definitions and parse command-line */
    const externalDefinitions = stack.getOptionDefinitions()
    const allDefinitions = [ ...internalDefinitions, ...externalDefinitions ]
    cliOptions = commandLineArgs(allDefinitions)
    options = util.deepMerge({}, this.internalOptions, storedOptions, cliOptions._all)
    this.options = options

    // let cli
    // try {
    //   cli = util.parseCommandLineOptions(this.internalOptions.stack.getOptionDefinitions(), this.internalOptions)
    // } catch (err) {
    //   if (err.name === 'UNKNOWN_OPTION') {
    //     halt(`${err.message}. Use --help/-h to see all options.`)
    //   } else {
    //     halt(err.stack)
    //   }
    // }
    //
    //
    //
    //
    // storedOptions.stack = Stack.create(storedOptions.stack)
    // storedOptions.stack.expand(optionsSoFar)
    // this.options = util.deepMerge({}, builtInDefaults, this.internalOptions, storedOptions, cli.options._all)

    /* --config */
    if (this.options.config) {
      for (const prop in this.options) {
        if (Array.isArray(this.options[prop]) && !this.options[prop].length) {
          delete this.options[prop]
        }
      }
      console.error(require('util').inspect(this.options, { depth: 6, colors: true }))
      process.exit(0)

      /* --version */
    } else if (this.options.version) {
      console.error(this.getVersion())
      process.exit(0)

      /* --help */
    } else if (this.options.help) {
      console.error(this.getUsage())
      process.exit(0)

    /* launch server and listen */
    } else {
      const Koa = require('koa')
      this.app = new Koa()
      this.server = this.getServer()
      this.features = this.options.stack.map(Feature => new Feature(this))
      this.attachView()
      const middlewares = this.getMiddlewares(this.features)
      middlewares.forEach(middleware => this.app.use(middleware))
      this.server.on('request', this.app.callback())
      this.server.listen(this.options.port, this.options.hostname)
      for (const feature of this.features) {
        if (feature.ready) {
          feature.ready(this)
        }
      }
    }
  }

  /**
   * Returns and array of middleware functions from a given stack.
   * @returns {middleware[]}
   * @ignore
   */
  getMiddlewares (features) {
    const flatten = require('reduce-flatten')
    return features
      .filter(feature => feature.middleware)
      .map(feature => feature.middleware(Object.assign({}, this.options)))
      .reduce(flatten, [])
      .filter(mw => mw)
  }

  /**
   * Returns a listening server which processes requests using the middleware supplied.
   * @returns {Server}
   * @ignore
   */
  getServer () {
    const options = this.options
    let key = options.key
    let cert = options.cert

    if (options.https && !(key && cert)) {
      key = path.resolve(__dirname, '..', 'ssl', '127.0.0.1.key')
      cert = path.resolve(__dirname, '..', 'ssl', '127.0.0.1.crt')
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

    /* on server-up message */
    if (!options.testMode) {
      server.on('listening', () => {
        const ipList = util.getIPList()
          .map(iface => `[underline]{${server.isHttps ? 'https' : 'http'}://${iface.address}:${options.port}}`)
          .join(', ')
        console.error('Serving at', ansi.format(ipList))
      })
    }

    return server
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
    this.server.on('error', err => halt(`Failed to start server: ${err.message}`))
    this.app.on('error', view.error)
  }

  getUsage () {
    const commandLineUsage = require('command-line-usage')
    const optionDefinitions = this.options.stack.getOptionDefinitions()
    const usageSections = require('./cli-data').usage(optionDefinitions)
    usageSections.unshift(this.getUsageHeader())
    usageSections.push(this.getUsageFooter())
    return commandLineUsage(usageSections)
  }

  /**
   * Returns version number, subclasses should override.
   * @returns {string}
   * @ignore
   */
  getVersion () {
    const pkg = require(path.resolve(__dirname, '..', 'package.json'))
    return pkg.version
  }

  /**
   * subclasses should override.
   * @ignore
   */
  getUsageHeader () {
    return {
      header: 'lws',
      content: 'A modular server application shell for creating a personalised local web server to support productive, full-stack Javascript development.'
    }
  }

  /**
   * subclasses should override.
   * @ignore
   */
  getUsageFooter () {
    return {
      content: 'Project home: [underline]{https://github.com/lwsjs/lws}'
    }
  }
}

function halt (msg) {
  console.error(ansi.format(msg, 'red'))
  process.exit(1)
}

/**
 * Return stored config object.
 * @return {object}
 * @ignore
 */
function getStoredConfig (configFilePath) {
  const walkBack = require('walk-back')
  const configFile = walkBack(process.cwd(), configFilePath || 'lws.config.js')
  return configFile ? require(configFile) : {}
}

module.exports = Lws
