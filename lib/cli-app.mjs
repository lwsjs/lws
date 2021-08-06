import { printError, getIPList, getStoredConfig } from './util.mjs'
import util from 'util'
import deepMerge from '@75lb/deep-merge'
import cliArgs from './cli-args.mjs'
import commandLineArgs from 'command-line-args'
import commandLineUsage from 'command-line-usage'
import MiddlewareStack from './middleware-stack.mjs'
import CliView from './view/cli-view.mjs'
import Lws from 'lws'
import open from 'open'
import tls from 'tls'
import path from 'path'
import ansi from 'ansi-escape-sequences'
import * as fsMain from 'fs'
import getModulePaths from 'current-module-paths'
const __dirname = getModulePaths(import.meta.url).__dirname
const fs = fsMain.promises

class LwsCli {
  constructor (options = {}) {
    this.logError = options.logError || console.error
    this.log = options.log || console.log
  }

  async start (argv) {
    try {
      const config = await this.getConfig(argv)
      const server = await this.execute(config)
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
    printError(err, '', this.logError)
    process.exitCode = 1
  }

  partialDefinitions () {
    return cliArgs
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
      moduleDir: [process.cwd()]
    }
  }

  /**
   * Load and merge options
   */
  async getConfig (argv) {
    /* get builtIn command-line options */
    let cliOptions = commandLineArgs(this.partialDefinitions(), { argv, partial: true, camelCase: true })
    const storedConfig = await getStoredConfig(cliOptions.configFile)

    let options = deepMerge(this.getDefaultOptions(), storedConfig, cliOptions)

    /* load middleware stack */
    const stack = await MiddlewareStack.from(options.stack, {
      paths: options.moduleDir
    })

    this.stack = stack // required by usage()
    const stackDefinitions = stack.getOptionDefinitions()

    /* default view */
    let view
    if (options.view) {
      view = options.view
    } else {
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
    options = deepMerge(options, storedConfig, cliOptions)
    options.stack = stack
    options.view = view
    return options
  }

  /**
   * @params {object} - Lws config.
   * @returns {HTTPServer}
   */
  async execute (config) {
    if (config.help) {
      this.showUsage()
    } else if (config.config) {
      this.showConfig(config)
    } else if (config.version) {
      await this.showVersion()
    } else if (config.listNetworkInterfaces) {
      this.printNetworkInterfaces(config.hostname)
    } else {
      return this.launchServer(config)
    }
  }

  async launchServer (config) {
    const lws = await Lws.create(config)
    config = lws.config
    const server = lws.server

    if (config.open) {
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
    for (const middleware of config.stack) {
      middleware[util.inspect.custom] = function (depth, config) {
        return config.stylize(this.constructor.name, 'special')
      }
    }
    this.log(util.inspect(config, { depth: 2, colors: true }))
  }

  async showVersion () {
    const version = JSON.parse(await fs.readFile(path.resolve(__dirname, '..', 'package.json'), 'utf8')).version
    this.log(version)
  }

  showUsage () {
    this.log(commandLineUsage(this.usage()))
  }

  printNetworkInterfaces (hostname) {
    const ipList = getIPList(hostname)
    const interfaces = ipList.map(iface => `- ${ansi.format(iface.name, 'bold')}: ${iface.address}`).join('\n')
    this.log(`\n${ansi.format('Available network interfaces:', 'underline')}\n${interfaces}\n`)
  }
}

export default LwsCli
