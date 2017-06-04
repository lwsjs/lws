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
        description: 'Print these usage instructions.'
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
        name: 'server',
        type: String,
        description: 'Use a custom server'
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
        header: 'Options',
        optionList: this.partialDefinitions()
      },
      {
        header: 'Feature stack',
        content: this.features.map(feature => {
          return {name: feature.constructor.name, desc: feature.description && feature.description()}
        })
      }
    ]
    // for (const feature of this.features) {
    //   if (feature.optionDefinitions) {
    //     sections.push({
    //       header: feature.constructor.name
    //     })
    //     sections.push({
    //       content: 'server application shell for creating a personalised local web server to support productive, full-stack Javascript'
    //     })
    //     sections.push({
    //       optionList: feature.optionDefinitions()
    //     })
    //   }
    // }
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

    /* load stored config */
    const storedOptions = getStoredConfig(initialOptions['config-file'] || cliOptions['config-file'])

    let options = util.deepMerge({}, initialOptions, storedOptions, cliOptions)

    /* establish the feature stack */
    const stack = Stack.create([
      cliOptions.stack,
      storedOptions.stack,
      initialOptions.stack
    ].find(s => s && s.length))
    stack.expand(options)

    /* now we have the stack, get definitions and parse command-line */
    this.features = stack.getFeatures()
    const stackDefinitions = this.features.getOptionDefinitions()
    const allDefinitions = [ ...this.partialDefinitions(), ...stackDefinitions ]
    cliOptions = commandLineArgs(allDefinitions)
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
      const HelpCommand = require('../help')
      const cmd = new HelpCommand()
      cmd._commands = this._commands
      return cmd.execute()
    } else if (options.config) {
      console.error(require('util').inspect(options, { depth: 6, colors: true }))
    } else {
      let Server
      if (options.https) {
        Server = require('./https-server')
      } else if (options.server) {
        const loadModule = require('load-module')
        Server = loadModule(options.server)
      } else {
        Server = require('./server')
      }
      const server = new Server()
      server.launch(options)
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
