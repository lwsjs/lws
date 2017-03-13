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
   * @param [options.stack} {string[]|Features[]} - Port
   */
  constructor (options) {
    this.options = options || {}
    if (this.options.stack) this.options.stack = arrayify(this.options.stack)
  }

  /**
   * Start the app.
   */
  start () {
    const cliOptions = util.parseCommandLineOptions()
    util.deepMerge(this.options, cliOptions._all)
    const options = this.options

    /* --config */
    if (options.config) {
      console.error(JSON.stringify(options, null, '  '))
      process.exit(0)

    /* --version */
    } else if (options.version) {
      const pkg = require(path.resolve(__dirname, '..', 'package.json'))
      console.error(pkg.version)
      process.exit(0)

    /* --help */
    } else if (options.help) {
      const commandLineUsage = require('command-line-usage')
      const usageSections = require('./cli-data').usage()
      const usage = commandLineUsage(usageSections)

      console.error(usage)
      process.exit(0)

    /* launch server and listen */
    } else {
      this.server = this.getServer()
      this.options.stack = util.expandStack(this.options.stack)
      const middlewares = this.getMiddlewareStack(this.options.stack)
      const Koa = require('koa')
      const app = new Koa()
      middlewares.forEach(middleware => app.use(middleware))
      this.server.on('request', app.callback())
      this.server.listen(this.options.port)
    }
  }

  /**
   * Returns and array of middleware functions from a given stack.
   * @returns {middleware[]}
   */
  getMiddlewareStack (stack) {
    return arrayify(stack)
      .map(Feature => new Feature(this))
      .filter(feature => feature.middleware)
      .map(feature => feature.middleware(this.options))
      .reduce(flatten, [])
      .filter(mw => mw)
  }

  // start () {
  //   const commandLineUsage = require('command-line-usage')
  //   const CliView = require('./cli-view')
  //   const cli = require('../lib/cli-data')
  //
  //   /* get stored config */
  //   const loadConfig = require('config-master')
  //   const stored = loadConfig('local-web-server')
  //
  //   /* read the config and command-line for feature paths */
  //   const featurePaths = (initOptions.stack || stored.stack).concat(parseFeaturePaths())
  //
  //   /**
  //    * Loaded feature modules
  //    * @type {Feature[]}
  //    */
  //   this.features = this._buildFeatureStack(featurePaths)
  //
  //   /* gather feature optionDefinitions and parse the command line */
  //   const featureOptionDefinitions = gatherOptionDefinitions(this.features)
  //   const usage = commandLineUsage(cli.usage(featureOptionDefinitions))
  //   const allOptionDefinitions = cli.optionDefinitions.concat(featureOptionDefinitions)
  //   let options = initOptions.testMode ? {} : parseCommandLineOptions(allOptionDefinitions, this.view)
  //
  //   /* combine in stored config */
  //   options = Object.assign(
  //     { port: 8000 },
  //     initOptions,
  //     stored,
  //     options.server,
  //     options.middleware,
  //     options.misc
  //   )
  //
  //   /**
  //    * Config
  //    * @type {object}
  //    */
  //   this.options = options
  //
  //   /**
  //    * Current view.
  //    * @type {View}
  //    */
  //   this.view = null
  //
  //   /* --config */
  //   if (options.config) {
  //     console.error(JSON.stringify(options, null, '  '))
  //     process.exit(0)
  //
  //   /* --version */
  //   } else if (options.version) {
  //     const pkg = require(path.resolve(__dirname, '..', 'package.json'))
  //     console.error(pkg.version)
  //     process.exit(0)
  //
  //   /* --help */
  //   } else if (options.help) {
  //     console.error(usage)
  //     process.exit(0)
  //   } else {
  //     /**
  //      * Node.js server
  //      * @type {Server}
  //      */
  //     this.server = this.getServer()
  //
  //     if (options.view) {
  //       const View = loadModule(options.view)
  //       this.view = new View(this)
  //     } else {
  //       this.view = new CliView(this)
  //     }
  //
  //     for (const feature of this.features) {
  //       if (feature.ready) {
  //         feature.ready(this)
  //       }
  //     }
  //   }
  // }

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

    // server.listen(options.port)

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
}

module.exports = Lws
