'use strict'
const Stack = require('./stack')
const util = require('../../util')

class ServeCommand {
  description () {
    return 'Launch a server.'
  }

  partialDefinitions () {
    return [
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
        name: 'max-connections',
        type: Number,
        description: 'Max connections'
      },
      {
        name: 'keepalive-timeout',
        type: Number,
        description: 'Blah.'
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
        name: 'server',
        type: String,
        description: 'Use a custom server',
        section: 'extension'
      },
      {
        name: 'stack',
        type: String,
        multiple: true,
        description: 'Feature stack.',
        typeLabel: '[underline]{feature} [underline]{...}',
        section: 'extension'
      },
      {
        name: 'module-dir',
        type: String,
        multiple: true,
        description: 'One or more directories to search for feature modules',
        typeLabel: '[underline]{feature} [underline]{...}',
        section: 'extension'
      },
      {
        name: 'module-prefix',
        type: String,
        description: 'Module prefix',
        section: 'extension'
      },
      {
        name: 'view',
        type: String,
        description: 'Event view.',
        typeLabel: '[underline]{path}',
        section: 'extension'
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
        header: 'Misc Options',
        content: 'Options which affect the app.'
      },
      {
        optionList: this.partialDefinitions().filter(def => def.section === 'core')
      },
      {
        header: 'Server Options',
        content: 'Options set on the server. Use to experiment with different server config.'
      },
      {
        optionList: this.partialDefinitions().filter(def => !def.section)
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
        content: this.features.map(feature => ({
          name: '↓ ' + feature.constructor.name,
          desc: feature.description && feature.description()
        }))
      },
      {
        header: 'Middleware options',
        optionList: this.features.getOptionDefinitions()
      }
    ]
    sections.push(
      {
        header: 'Commands',
        content: Array.from(this._commands)
          .filter(([name, command]) => name)
          .map(([name, command]) => ({ name: name, desc: command.description && command.description() }))
      },
      {
        content: 'Project home: [underline]{https://github.com/lwsjs/lws}'
      }
    )
    return sections
  }

  /**
   * Load and merge options
   */
  getOptions (initialOptions, argv) {
    initialOptions = Object.assign({ port: 8000 }, initialOptions)
    const commandLineArgs = require('command-line-args')
    /* get builtIn command-line options */
    let cliOptions = commandLineArgs(this.partialDefinitions(), { argv, partial: true })
    util.camelCaseObject(cliOptions)
    /* load stored config */
    const storedOptions = getStoredConfig(initialOptions.configFile || cliOptions.configFile)

    let options = util.deepMerge({}, initialOptions, storedOptions, cliOptions)

    /* establish the feature stack */
    const stack = Stack.create([
      cliOptions.stack,
      storedOptions.stack,
      initialOptions.stack
    ].find(s => s && s.length))
    stack.expand(options)

    /* now we have the stack, get definitions and parse command-line */
    this.features = stack.getFeatures() // for usage
    const stackDefinitions = this.features.getOptionDefinitions()
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
      const cmd = this._commands.get('help')
      if (cmd) {
        return cmd.execute()
      }
    } else if (options.config) {
      console.error(require('util').inspect(options, { depth: 6, colors: true }))
    } else {
      let Server
      if (options.https) {
        const ServerBase = require('./server')
        Server = require('./https-server')(ServerBase)
      } else if (options.server) {
        const loadModule = require('load-module')
        const ServerBase = require('./server')
        Server = loadModule(options.server)(ServerBase)
      } else {
        Server = require('./server')
      }
      const server = new Server()
      server.launch(options)
      this.server = server
      return server
    }
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
