'use strict'
const Stack = require('../stack')
const util = require('../util')
const arrayify = require('array-back')

class ServeCommand {
  description () {
    return 'Launch a server.'
  }

  partialDefinitions () {
    return [
      {
        name: 'port',
        alias: 'p',
        type: Number,
        description: 'Web server port.',
        section: 'server'
      },
      {
        name: 'hostname',
        type: String,
        description: 'The hostname (or IP address) to listen on. Defaults to 0.0.0.0.',
        section: 'server'
      },
      {
        name: 'max-connections',
        type: Number,
        description: 'The maximum count of concurrent connections supported by the server.',
        section: 'server'
      },
      {
        name: 'keep-alive-timeout',
        type: Number,
        description: 'The period (in milliseconds) of inactivity a connection will wait before being destroyed. Set to `0` to disable keep-alive timeout behaviour.',
        section: 'server'
      },
      {
        name: 'https',
        type: Boolean,
        description: 'Enable HTTPS using a built-in key and cert registered to the hosts 127.0.0.1 and localhost.',
        section: 'tls'
      },
      {
        name: 'key',
        type: String,
        typeLabel: '[underline]{file}',
        description: 'SSL key file. Supply along with --cert to launch a https server.',
        section: 'tls'
      },
      {
        name: 'cert',
        type: String,
        typeLabel: '[underline]{file}',
        description: 'SSL cert file. Supply along with --key to launch a https server.',
        section: 'tls'
      },
      {
        name: 'pfx',
        type: String,
        typeLabel: '[underline]{file}',
        description: 'Optional PFX or PKCS12 encoded private key and certificate chain. An alternative to providing --key and --cert.',
        section: 'tls'
      },
      {
        name: 'ciphers',
        type: String,
        description: 'Optional cipher suite specification, replacing the default.',
        section: 'tls'
      },
      {
        name: 'secure-protocol',
        type: String,
        description: 'Optional SSL method to use, default is "SSLv23_method".',
        section: 'tls'
      },
      {
        name: 'stack',
        type: String,
        multiple: true,
        description: 'Constructs a middleware stack using the modules supplied.',
        typeLabel: '[underline]{path} [underline]{...}',
        section: 'extension'
      },
      {
        name: 'server',
        type: String,
        typeLabel: '[underline]{path}',
        description: 'A path to a custom server module, e.g. lws-http2',
        section: 'extension'
      },
      {
        name: 'app',
        type: String,
        typeLabel: '[underline]{path}',
        description: 'A path to a custom app',
        section: 'extension'
      },
      {
        name: 'module-dir',
        type: String,
        multiple: true,
        description: 'One or more directories to search for middleware modules',
        typeLabel: '[underline]{path} [underline]{...}',
        section: 'extension'
      },
      {
        name: 'module-prefix',
        type: String,
        description: 'Prefix to try when loading any module, defaults to `lws-`.',
        section: 'extension'
      },
      {
        name: 'view',
        type: String,
        description: 'Event view.',
        typeLabel: '[underline]{path}',
        section: 'extension'
      },
      {
        name: 'help',
        alias: 'h',
        type: Boolean,
        description: 'Print these usage instructions.',
        section: 'core'
      },
      {
        name: 'verbose',
        type: Boolean,
        alias: 'v',
        description: 'Verbose output.',
        section: 'core'
      },
      {
        name: 'version',
        type: Boolean,
        description: 'Print the version number.',
        section: 'core'
      },
      {
        name: 'config-file',
        alias: 'c',
        type: String,
        description: 'Config filename to use, defaults to "lws.config.js".',
        typeLabel: '[underline]{file}',
        defaultValue: 'lws.config.js',
        section: 'core'
      },
      {
        name: 'config',
        type: Boolean,
        description: 'Print the active config.',
        section: 'core'
      }
    ]
  }

  usage () {
    const sections = [
      {
        header: 'lws',
        content: 'A modular server application shell for creating a personalised local web server to support productive, full-stack Javascript development.'
      },
      {
        header: 'Synopsis',
        content: [
          '$ lws <options>',
          '$ lws [underline]{command} <options>'
        ]
      },
      {
        header: 'Server Options',
        content: 'Options set on the server.'
      },
      {
        optionList: this.partialDefinitions().filter(def => def.section === 'server')
      },
      {
        content: 'HTTPS/TLS specific options. To launch an HTTPS server you must supply either --https, --pfx or --key and --cert together.'
      },
      {
        optionList: this.partialDefinitions().filter(def => def.section === 'tls')
      },
      {
        header: 'Extension Options',
        content: 'Options to load extensions'
      },
      {
        optionList: this.partialDefinitions().filter(def => def.section === 'extension')
      },
      {
        header: 'Middleware stack',
        content: this.stack.length
          ? this.stack.map(mw => ({
            name: '↓ ' + mw.constructor.name,
            desc: mw.description && mw.description()
          }))
          : '[italic]{Stack empty, supply one or more middlewares using --stack.}'
      }
    ]
    const stackOptionDefinitions = this.stack.getOptionDefinitions()
    if (stackOptionDefinitions.length) {
      sections.push({
        header: 'Middleware options',
        optionList: stackOptionDefinitions
      })
    }
    sections.push(
      {
        header: 'Misc Options',
      },
      {
        optionList: this.partialDefinitions().filter(def => def.section === 'core')
      }
    )
    const commands = Array.from(this._commands)
      .filter(([name, command]) => name)
    if (commands.length) {
      sections.push(
        {
          header: 'Commands',
          content: commands
            .map(([name, command]) => ({ name: name, desc: command.description && command.description() }))
        }
      )
    }
    sections.push({
      content: 'Project home: [underline]{https://github.com/lwsjs/lws}'
    })
    return sections
  }

  /**
   * Load and merge options
   */
  getOptions (initialOptions, argv) {
    initialOptions = Object.assign({ port: 8000 }, initialOptions)
    initialOptions.stack = arrayify(initialOptions.stack)
    const commandLineArgs = require('command-line-args')
    /* get builtIn command-line options */
    let cliOptions = commandLineArgs(this.partialDefinitions(), { argv, partial: true })
    util.camelCaseObject(cliOptions)
    /* load stored config */
    const storedOptions = getStoredConfig(initialOptions.configFile || cliOptions.configFile)

    let options = util.deepMerge({}, initialOptions, storedOptions, cliOptions)

    /* establish the feature stack */
    const firstDefinedStack = [
      cliOptions.stack,
      storedOptions.stack,
      initialOptions.stack
    ].find(s => s && s.length)
    const stack = Stack.create(firstDefinedStack, options)
    this.stack = stack // required by usage()

    /* now we have the stack, get definitions and parse command-line */
    const stackDefinitions = stack.getOptionDefinitions()
    const allDefinitions = [ ...this.partialDefinitions(), ...stackDefinitions ]
    cliOptions = commandLineArgs(allDefinitions)
    util.camelCaseObject(cliOptions)
    options = util.deepMerge({}, initialOptions, storedOptions, cliOptions)
    options.stack = stack
    return options
  }

  /**
   * @returns {HTTPServer}
   */
  execute (options, argv) {
    options = this.getOptions(options, argv)
    if (options.help) {
      this.showUsage()
    } else if (options.config) {
      this.showConfig(options)
    } else if (options.version) {
      this.showVersion()
    } else {
      const Lws = require('../lws')
      const lws = new Lws(options)
      lws.launch()

      if (options.app) {
        const loadModule = require('load-module')
        const App = loadModule(options.app)
        const app = new App(lws)
      }
      return lws
    }
  }

  showConfig (options) {
    console.log(require('util').inspect(options, { depth: 1, colors: true }))
  }

  showVersion () {
    const path = require('path')
    const pkg = require(path.resolve(__dirname, '..', '..', 'package.json'))
    console.log(pkg.version)
  }

  showUsage () {
    const commandLineUsage = require('command-line-usage')
    console.log(commandLineUsage(this.usage()))
  }
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
