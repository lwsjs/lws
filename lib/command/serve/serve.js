'use strict'
const Stack = require('./stack')
const util = require('../../util')

class ServeCommand {
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
        content: 'Launch a webserver.'
      },
      {
        header: 'Synopsis',
        content: [
          '$ lws serve <options>'
        ]
      },
      {
        header: 'Options',
        optionList: this.optionDefinitions()
      },
      {
        header: 'Features',
        content: this.features
      },
      {
        content: 'Project home: [underline]{https://github.com/lwsjs/lws}'
      }
    ]
  }

  getOptions (constructorOptions, argv) {
    constructorOptions = Object.assign({ port: 8000 }, constructorOptions)
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
      const Server = require('./server')
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
