'use strict'
const Stack = require('../stack')
const util = require('../util')
const ansi = require('ansi-escape-sequences')
const Command = require('./command')

class ServeCommand extends Command {
  constructor () {
    super()
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

  description () {
    return 'Launch a server.'
  }

  optionDefinitions () {
    return [
      {
        name: 'help',
        alias: 'h',
        type: Boolean,
        description: 'Print these usage instructions.'
      },
      {
        name: 'port',
        alias: 'p',
        type: Number,
        description: 'Web server port.'
      },
      {
        name: 'hostname',
        type: String,
        description: 'The hostname (or IP address) to listen on. Defaults to 0.0.0.0.'
      },
      {
        name: 'key',
        type: String,
        typeLabel: '[underline]{file}',
        description: 'SSL key. Supply along with --cert to launch a https server.'
      },
      {
        name: 'cert',
        type: String,
        typeLabel: '[underline]{file}',
        description: 'SSL cert. Supply along with --key to launch a https server.'
      },
      {
        name: 'https',
        type: Boolean,
        description: 'Enable HTTPS using a built-in key and cert, registered to the domain 127.0.0.1.'
      },
      {
        name: 'stack',
        type: String,
        multiple: true,
        description: 'Feature stack.',
        typeLabel: '[underline]{feature} [underline]{...}'
      },
      {
        name: 'module-dir',
        type: String,
        multiple: true,
        description: 'One or more directories to search for feature modules',
        typeLabel: '[underline]{feature} [underline]{...}'
      },
      {
        name: 'module-prefix',
        type: String,
        description: 'Module prefix'
      },
      {
        name: 'verbose',
        type: Boolean,
        alias: 'v',
        description: 'Verbose output.'
      },
      {
        name: 'config-file',
        alias: 'c',
        type: String,
        description: 'Config filename to use, defaults to "lws.config.js".',
        typeLabel: '[underline]{file}',
        defaultValue: 'lws.config.js'
      },
      {
        name: 'config',
        type: Boolean,
        description: 'Print the active config.'
      }
    ]
  }

  usage () {
    return [
      {
        header: 'lws serve',
        content: this.description()
      },
      {
        header: 'Synopsis',
        content: [
          '$ lws serve <options>',
          '$ lws --help'
        ]
      },
      {
        header: 'Options',
        optionList: this.optionDefinitions()
      }
    ]
  }

  getOptions (constructorOptions, argv) {
    const commandLineArgs = require('command-line-args')
    /* get builtIn command-line options */
    let cliOptions = commandLineArgs(this.optionDefinitions(), { argv, partial: true })

    /* load stored config */
    const storedOptions = getStoredConfig(constructorOptions['config-file'] || cliOptions['config-file'])

    let options = util.deepMerge({}, constructorOptions, storedOptions, cliOptions)

    /* establish the feature stack */
    const stack = Stack.create([
      cliOptions.stack,
      storedOptions.stack,
      constructorOptions.stack
    ].find(s => s && s.length))
    stack.expand(options)

    /* now we have the stack, get definitions and parse command-line */
    const features = stack.getFeatures()
    const stackDefinitions = features.getOptionDefinitions()
    const allDefinitions = [ ...this.optionDefinitions(), ...stackDefinitions ]
    cliOptions = commandLineArgs(allDefinitions)
    options = util.deepMerge({}, constructorOptions, storedOptions, cliOptions)
    options.stack = stack
    this.options = options
    return options
  }

  /**
   * @returns {HTTPServer}
   */
  execute (options) {
    if (options.help) {
      const commandLineUsage = require('command-line-usage')
      console.error(commandLineUsage(this.usage()))
    } else if (options.config) {
      console.error(require('util').inspect(options, { depth: 6, colors: true }))
    } else {
      const Koa = require('koa')
      this.app = new Koa()
      this.server = getServer(options)
      this.features = options.stack.getFeatures()
      this.attachView()
      const middlewares = this.features.getMiddlewares(options)
      middlewares.forEach(middleware => this.app.use(middleware))
      this.server.on('request', this.app.callback())
      this.server.listen(options.port, options.hostname)
      for (const feature of this.features) {
        if (feature.ready) {
          feature.ready(this)
        }
      }
      /* on server-up message */
      this.server.on('listening', () => {
        const ipList = util.getIPList()
          .map(iface => `[underline]{${this.server.isHttps ? 'https' : 'http'}://${iface.address}:${options.port}}`)
          .join(', ')
        console.error('Serving at', ansi.format(ipList))
      })
    }
  }

  attachView () {
    const View = require('../cli-view')
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
    this.server.on('error', view.error)
    this.app.on('error', view.error)
  }
}

/**
 * Returns a listening server which processes requests using the middleware supplied.
 * @returns {Server}
 * @ignore
 */
function getServer (options) {
  let key = options.key
  let cert = options.cert

  if (options.https && !(key && cert)) {
    const path = require('path')
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

  return server
}

/**
 * Return stored config object.
 * @return {object}
 * @ignore
 */
function getStoredConfig (configFilePath) {
  if (!configFilePath) return {}
  const walkBack = require('walk-back')
  const configFile = walkBack(process.cwd(), configFilePath || 'lws.config.js')
  return configFile ? require(configFile) : {}
}

module.exports = ServeCommand
