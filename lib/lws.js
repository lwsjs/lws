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
    this.options.stack = util.expandStack(this.options.stack)
    const cli = util.parseCommandLineOptions(util.getOptionDefinitions(this.options.stack))
    // console.log(this.options)
    // console.log(cli.options._all)
    this.options = util.deepMerge({ port: 8000 }, this.options, cli.options._all)
    const options = this.options

    // console.error(require('util').inspect(options, { depth: 6, colors: true }))

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
      const optionDefinitions = util.getOptionDefinitions(options.stack)
      const usageSections = require('./cli-data').usage(optionDefinitions)
      const usage = commandLineUsage(usageSections)

      console.error(usage)
      process.exit(0)

    /* launch server and listen */
    } else {
      this.server = this.getServer()
      const middlewares = this.getMiddlewares(this.options.stack)
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
  getMiddlewares (stack) {
    return arrayify(stack)
      .map(Feature => new Feature(this))
      .filter(feature => feature.middleware)
      .map(feature => feature.middleware(this.options))
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
