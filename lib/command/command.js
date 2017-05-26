class Command {
  optionDefinitions () {
    return []
  }
  description () { return '' }
  usage () {
    return [
      { header: 'Options', optionList: this.optionDefinitions() }
    ]
  }

  start (constructorOptions, argv) {
    const commandLineArgs = require('command-line-args')

    /* parse global options */
    // const globalOptionsDefinitions = require('./global-options')
    // const globalOptions = commandLineArgs(globalOptionsDefinitions)

    /* load stored config */
    const storedOptions = getStoredConfig(constructorOptions['config-file'] || globalOptions['config-file'])

    if (this.subCommands) {
      const subCommands = this.subCommands()
      const commandLineCommands = require('command-line-commands')
      const sub = commandLineCommands(Array.from(subCommands.keys()), argv)
      const cmd = subCommands.get(sub.command)
      return cmd.start(constructorOptions, sub.argv)
    } else {
      let options = {}

      /* if the command defines command-line options, parse them */
      if (this.optionDefinitions) {
        if (this.getOptions) {
          try {
            options = this.getOptions(constructorOptions, argv)
          } catch (err) {
            console.error(require('util').inspect(err, { depth: 6, colors: true }))
            throw err
          }
        } else {
          const commandOptions = commandLineArgs(this.optionDefinitions(), { argv })
          options = util.deepMerge({}, constructorOptions, commandOptions)
        }
      } else {
        options = util.deepMerge({}, constructorOptions)
      }

      /* merge options and execute */
      return this.execute(options)
    }
  }
}

Command.create = function () {
  return new this(...arguments)
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

module.exports = Command
