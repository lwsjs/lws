class LwsCli {
  constructor (options) {
    options = options || {}
    this.logError = options.logError || console.error
    this.log = options.log || console.log
  }

  start (argv) {
    try {
      const options = this.getOptions(argv)
      const server = this.execute(options)
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
        content: 'The modular web server for productive full-stack development.'
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
      moduleDir: [ '.' ],
      modulePrefix: 'lws-'
    }
  }

  /**
   * Load and merge options
   */
  getOptions (argv) {
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

    /* establish the view */
    const View = require('./view/view-base')
    const viewModule = View.load(options.view) || require('./view/cli-view')
    const ViewClass = viewModule(View)
    const view = new ViewClass({ log: options.log || this.log, logError: options.logError || this.logError })
    this.view = view // required by usage()
    const viewDefinitions = view.optionDefinitions ? view.optionDefinitions() : []

    /* now we have the stack and view definitions, parse command-line */
    const allDefinitions = [ ...this.partialDefinitions(), ...viewDefinitions, ...stackDefinitions ]
    cliOptions = commandLineArgs(allDefinitions, { argv, camelCase: true })
    options = util.deepMerge({}, storedConfig, cliOptions)
    options.stack = stack
    options.view = view
    return options
  }

  /**
   * @returns {HTTPServer}
   */
  execute (options) {
    if (options.help) {
      this.showUsage()
    } else if (options.config) {
      this.showConfig(options)
    } else if (options.version) {
      this.showVersion()
    } else {
      return this.launchServer(options)
    }
  }

  launchServer (options) {
    const Lws = require('../')
    const lws = new Lws()

    lws.on('verbose', (key, value) => {
      options.view.write(key, value, options)
    })

    const server = lws.listen(options)

    if (options.open) {
      const open = require('open')
      const tls = require('tls')
      const protocol = server instanceof tls.Server ? 'https' : 'http'
      const host = options.hostname || '127.0.0.1'
      open(`${protocol}://${host}:${options.port}`)
    }

    return server
  }

  showConfig (options) {
    options = Object.assign({}, options)
    delete options.config
    delete options.moduleDir
    delete options.modulePrefix
    const util = require('util')
    for (const middleware of options.stack) {
      middleware[util.inspect.custom] = function (depth, options) {
        return options.stylize(this.constructor.name, 'special')
      }
    }
    this.log(require('util').inspect(options, { depth: 1, colors: true }))
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
}

module.exports = LwsCli
