'use strict'
const path = require('path')
const arrayify = require('array-back')
const util = require('./util')
const t = require('typical')

/**
 *Creating command-line web servers suitable for full-stack javascript development.
 * @module lws
 */

/**
 * @alias module:lws
 * @example
 * const Lws = require('lws')
 * const lws = new Lws()
 * lws.start({ https: true})
 */
class Lws {
  /**
   * @param [options] {object} - Server options
   * @param [options.port] {number} - Port
   * @param [options.hostname] {string} -The hostname (or IP address) to listen on. Defaults to 0.0.0.0.
   * @param [options.config-file] {string} - Config file, defaults to 'lws.config.js'.
   * @param [options.stack] {string[]|Features[]} - Array of feature classes, or filenames of modules exporting a feature class.
   * @param [options.module-dir] {string[]} - One or more directories to search for feature modules.
   * @param [options.https] {boolean} - Enable HTTPS using a built-in key and cert, registered to the domain 127.0.0.1.
   * @param [options.key] {string} - SSL key. Supply along with --cert to launch a https server.
   * @param [options.cert] {string} - SSL cert. Supply along with --key to launch a https server.
   */
  constructor (options) {
    const builtInDefaults = {
      port: 8000,
      'config-file': 'lws.config.js'
    }
    this.internalOptions = Object.assign({}, builtInDefaults, options)
    this.constructorOptions = Object.assign({}, builtInDefaults, options)

    this.commands = new Map()
    this.commands.set('serve', './command/serve')
    this.commands.set('version', './command/version')
    this.commands.set('config', './command/config')
    this.commands.set('help', './command/help')
  }

  /**
   * Start the app.
   */
  start () {
    for (const [ name, cmd ] of this.commands) {
      if (typeof cmd === 'string') {
        const Command = require(cmd)
        this.commands.set(name, new Command())
      } else if (t.isClass(cmd)) {
        this.commands.set(name, new cmd())
      }
    }
    const helpCommand = this.commands.get('help')
    helpCommand._commands = this.commands

    const commandLineCommands = require('command-line-commands')
    const commandLineArgs = require('command-line-args')

    /* parse command */
    const { command, argv } = commandLineCommands(Array.from(this.commands.keys()))
    let cmd = this.commands.get(command)

    /* parse global options */
    const globalOptionsDefinitions = require('./global-options')
    const globalOptions = commandLineArgs(globalOptionsDefinitions)

    /* load stored config */
    const storedOptions = getStoredConfig(this.constructorOptions['config-file'] || globalOptions['config-file'])

    /* load command options, if it has any */
    let commandOptions = {}
    let options = {}
    if (cmd.optionDefinitions) {
      if (cmd.getOptions) {
        try {
          options = cmd.getOptions(this.constructorOptions, storedOptions, argv)
        } catch (err) {
          console.error(require('util').inspect(err, { depth: 6, colors: true }))
        }
      } else {
        commandOptions = commandLineArgs(cmd.optionDefinitions(), { argv })
        options = util.deepMerge({}, this.constructorOptions, storedOptions, commandOptions)
      }
    } else {
      options = util.deepMerge({}, this.constructorOptions, storedOptions)
    }

    /* merge options and execute */
    return cmd.execute(options)
  }
}

function halt (msg) {
  console.error(ansi.format(msg, 'red'))
  process.exit(1)
}

/**
 * Return stored config object.
 * @return {object}
 * @ignore
 */
function getStoredConfig (configFilePath) {
  if (!configFilePath) return {}
  const walkBack = require('walk-back')
  const configFile = walkBack(process.cwd(), configFilePath)
  return configFile ? require(configFile) : {}
}

module.exports = Lws
