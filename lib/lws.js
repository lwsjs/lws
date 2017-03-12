'use strict'
const path = require('path')
const flatten = require('reduce-flatten')
const arrayify = require('array-back')
const ansi = require('ansi-escape-sequences')
const util = require('./util')

/**
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

  getMiddlewareStack (features) {
    return arrayify(features)
      .map(Feature => new Feature(this))
      .filter(feature => feature.middleware)
      .map(feature => feature.middleware(this.options))
      .reduce(flatten, [])
      .filter(feature => feature)
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
   * Returns a middleware application suitable for passing to `http.createServer`. The application is a function with three args (req, res and next) which can be created by express, Koa or hand-rolled.
   * @returns {function}
   */
  // getApplication () {
  //   const Koa = require('koa')
  //   const app = new Koa()
  //   const compose = require('koa-compose')
  //   const convert = require('koa-convert')
  //
  //   const middlewareStack = this.features
  //     .filter(mw => mw.middleware)
  //     .map(mw => mw.middleware(this.options, this))
  //     .reduce(flatten, [])
  //     .filter(mw => mw)
  //     .map(convert)
  //
  //   app.use(compose(middlewareStack))
  //   app.on('error', err => {
  //     console.error(ansi.format(err.stack, 'red'))
  //   })
  //   return app.callback()
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
