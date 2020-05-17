class LwsCli {
  constructor (options = {}) {
    this.logError = options.logError || console.error
    this.log = options.log || console.log
  }

  start (argv) {
    try {
      const config = this.getConfig(argv)
      const server = this.execute(config)
      if (server) {
        server.on('error', err => {
          this.printError(err)
        })
      }
      return server
    } catch (err) {
      this.printError(err)
    }
  }

  printError (err) {
    const util = require('./util')
    util.printError(err, '', this.logError)
    process.exitCode = 1
  }

  partialDefinitions () {
    return require('./cli-args')
  }

  usage () {
    const sections = [
      {
        header: 'lws',
        content: 'A lean, modular web server for rapid full-stack development.'
      },
      {
        header: 'Synopsis',
        content: [
          '$ lws <options>',
          '$ lws {underline command} <options>'
        ]
      },
      {
        header: 'Server Options',
        content: 'Options set on the server.'
      },
      {
        optionList: this.partialDefinitions().filter(def => def.section === 'server'),
        reverseNameOrder: true
      },
      {
        content: 'HTTPS/TLS specific options.'
      },
      {
        optionList: this.partialDefinitions().filter(def => def.section === 'tls'),
        reverseNameOrder: true
      },
      {
        header: 'Extension Options'
      },
      {
        optionList: this.partialDefinitions().filter(def => def.section === 'extension'),
        reverseNameOrder: true
      },
      {
        header: 'Middleware stack',
        content: this.stack.length
          ? this.stack.map(mw => ({
            name: '↓ ' + mw.constructor.name,
            desc: mw.description && mw.description()
          }))
          : '{italic Stack empty, supply one or more middlewares using --stack.}'
      }
    ]
    const stackOptionDefinitions = this.stack.getOptionDefinitions()
    if (stackOptionDefinitions.length) {
      sections.push({
        header: 'Middleware options',
        optionList: stackOptionDefinitions,
        reverseNameOrder: true
      })
    }
    const viewOptionDefinitions = this.view.optionDefinitions()
    if (viewOptionDefinitions.length) {
      sections.push({
        header: 'View options',
        optionList: viewOptionDefinitions,
        reverseNameOrder: true
      })
    }
    sections.push(
      {
        header: 'Misc Options'
      },
      {
        optionList: this.partialDefinitions().filter(def => def.section === 'core'),
        reverseNameOrder: true
      }
    )
    sections.push({
      content: 'Project home: {underline https://github.com/lwsjs/lws}'
    })
    return sections
  }

  getDefaultOptions () {
    return {
      port: 8000,
      moduleDir: ['.'],
      modulePrefix: 'lws-'
    }
  }

  /**
   * Load and merge options
   */
  getConfig (argv) {
    const util = require('./util')
    const commandLineArgs = require('command-line-args')
    /* get builtIn command-line options */
    let cliOptions = commandLineArgs(this.partialDefinitions(), { argv, partial: true, camelCase: true })
    const storedConfig = util.getStoredConfig(cliOptions.configFile)

    let options = util.deepMerge(this.getDefaultOptions(), storedConfig, cliOptions)

    /* load middleware stack */
    const MiddlewareStack = require('./middleware-stack')
    const stack = MiddlewareStack.from(options.stack, {
      paths: options.moduleDir,
      prefix: options.modulePrefix
    })

    this.stack = stack // required by usage()
    const stackDefinitions = stack.getOptionDefinitions()

    /* default view */
    let view
    if (options.view) {
      view = options.view
    } else {
      const CliView = require('./view/cli-view')
      view = new CliView({
        log: options.log || this.log,
        logError: options.logError || this.logError
      })
    }

    this.view = view // required by usage()
    const viewDefinitions = view.optionDefinitions ? view.optionDefinitions() : []

    /* now we have the stack and view definitions, parse command-line */
    const allDefinitions = [...this.partialDefinitions(), ...viewDefinitions, ...stackDefinitions]
    cliOptions = commandLineArgs(allDefinitions, { argv, camelCase: true })
    options = util.deepMerge(options, storedConfig, cliOptions)
    options.stack = stack
    options.view = view
    return options
  }

  /**
   * @params {object} - Lws config.
   * @returns {HTTPServer}
   */
  execute (config) {
    if (config.help) {
      this.showUsage()
    } else if (config.config) {
      this.showConfig(config)
    } else if (config.version) {
      this.showVersion()
    } else if (config.listNetworkInterfaces) {
      this.printNetworkInterfaces(config.hostname)
    } else {
      return this.launchServer(config)
    }
  }

  launchServer (config) {
    const Lws = require('../')
    const lws = Lws.create(config)
    config = lws.config
    const server = lws.server

    if (config.open) {
      const open = require('open')
      const tls = require('tls')
      const protocol = server instanceof tls.Server ? 'https' : 'http'
      const host = config.hostname || '127.0.0.1'
      const url = `${protocol}://${host}:${config.port}`
      lws.emit('verbose', 'open', url)
      open(url, { url: true })
    }

    return server
  }

  showConfig (config) {
    config = Object.assign({}, config)
    delete config.config
    delete config._unknown
    const util = require('util')
    for (const middleware of config.stack) {
      middleware[util.inspect.custom] = function (depth, config) {
        return config.stylize(this.constructor.name, 'special')
      }
    }
    this.log(require('util').inspect(config, { depth: 2, colors: true }))
  }

  showVersion () {
    const path = require('path')
    const pkg = require(path.resolve(__dirname, '..', 'package.json'))
    this.log(pkg.version)
  }

  showUsage () {
    const commandLineUsage = require('command-line-usage')
    this.log(commandLineUsage(this.usage()))
  }

  printNetworkInterfaces (hostname) {
    const ansi = require('ansi-escape-sequences')
    const util = require('./util')
    const ipList = util.getIPList(hostname)
    const interfaces = ipList.map(iface => `- ${ansi.format(iface.name, 'bold')}: ${iface.address}`).join('\n')
    this.log(`\n${ansi.format('Available network interfaces:', 'underline')}\n${interfaces}\n`)
  }
}

module.exports = LwsCli
