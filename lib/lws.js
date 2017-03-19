'use strict'
const path = require('path')
const flatten = require('reduce-flatten')
const arrayify = require('array-back')
const ansi = require('ansi-escape-sequences')
const util = require('./util')

/**
 * A module for creating command-line web servers suitable for full-stack javascript development.
 * @module lws
 */

/**
 * @alias module:lws
 */
class Lws {
  /**
   * @param [options] {object} - Server options
   * @param [options.port} {number} - Port
   * @param [options.config-name} {string} - The name to find stored config under, defaults to 'lws'.
   * @param [options.stack} {string[]|Features[]} - Array of feature classes, or filenames of modules exporting a feature class.
   */
  constructor (options) {
    this.options = Object.assign({}, options)
    if (this.options.stack) this.options.stack = arrayify(this.options.stack)
  }

  /**
   * Start the app.
   */
  start () {
    this.options.stack = util.expandStack(this.options.stack)
    let cli
    try {
      cli = util.parseCommandLineOptions(util.getOptionDefinitions(this.options.stack))
    } catch (err) {
      if (err.name === 'UNKNOWN_OPTION') {
        halt(`${err.message}. Use --help/-h to see all options.`)
      } else {
        halt(err.stack)
      }
    }
    const builtInDefaults = { port: 8000 }
    const optionsSoFar = util.deepMerge({}, builtInDefaults, this.options, cli.options._all)

    const storedOptions = this.getStoredConfig(optionsSoFar['config-file'])
    storedOptions.stack = util.expandStack(storedOptions.stack)
    this.options = util.deepMerge({}, builtInDefaults, this.options, storedOptions, cli.options._all)
    const options = this.options

    /* --config */
    if (options.config) {
      console.error(require('util').inspect(options, { depth: 6, colors: true }))
      process.exit(0)

    /* --version */
    } else if (options.version) {
      console.error(this.getVersion())
      process.exit(0)

    /* --help */
    } else if (options.help) {
      const commandLineUsage = require('command-line-usage')
      const optionDefinitions = util.getOptionDefinitions(options.stack)
      const usageSections = require('./cli-data').usage(optionDefinitions)
      const usage = commandLineUsage(usageSections)

      console.error(usage)
      process.exit(0)

    /* launch server and listen */
    } else {
      this.server = this.getServer()
      /* Features should be a collection class with `getMiddlewares`, `expandStack`,
      getOptionDefinitions etc on it */
      this.features = this.options.stack.map(Feature => new Feature(this))
      this.attachView()
      const middlewares = this.getMiddlewares(this.features)
      const Koa = require('koa')
      const app = new Koa()
      middlewares.forEach(middleware => app.use(middleware))
      this.server.on('request', app.callback())
      this.server.listen(this.options.port, this.options.hostname)
      this.server.on('error', err => halt(`Failed to start server: ${err.message}`))
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
   */
  getMiddlewares (features) {
    return features
      .filter(feature => feature.middleware)
      .map(feature => feature.middleware(Object.assign({}, this.options)))
      .reduce(flatten, [])
      .filter(mw => mw)
  }

  /**
   * Returns a listening server which processes requests using the middleware supplied.
   * @returns {Server}
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

  getVersion () {
    const pkg = require(path.resolve(__dirname, '..', 'package.json'))
    return pkg.version
  }

  attachView () {
    const View = require('./cli-view')
    const view = new View()
    for (const feature of this.features) {
      if (feature.on) {
        feature.on('log', view.log)
        if (this.options.verbose) {
          feature.on('start', view.start)
          feature.on('verbose', view.verbose)
        }
      }
    }
  }

  getStoredConfig (configFilePath) {
    const walkBack = require('walk-back')
    const configFile = walkBack(process.cwd(), configFilePath || 'lws.config.js')
    if (configFile) {
      return require(configFile)
    } else {
      return {}
    }
  }
}

function halt (msg) {
  console.error(ansi.format(msg, 'red'))
  process.exit(1)
}

module.exports = Lws
