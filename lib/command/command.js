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
    const util = require('../util')
    const commandLineArgs = require('command-line-args')

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
          options = this.getOptions(constructorOptions, argv)
        } else {
          const commandCliOptions = commandLineArgs(this.optionDefinitions(), { argv })
          options = util.deepMerge({}, constructorOptions, commandCliOptions)
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

module.exports = Command
