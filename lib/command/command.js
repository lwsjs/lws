class Command {
  optionDefinitions () {
    return [
      {
        name: 'help',
        alias: 'h',
        type: Boolean,
        description: 'Print these usage instructions.'
      }
    ]
  }
  description () { return '' }
  usage () {
    return [
      { header: 'Options', optionList: this.optionDefinitions() }
    ]
  }

  start (constructorOptions, argv) {
    if (this.subCommands) {
      const subCommands = this.subCommands()
      const commandLineCommands = require('command-line-commands')
      const sub = commandLineCommands(Array.from(subCommands.keys()), argv)
      const cmd = subCommands.get(sub.command)
      return cmd.start(constructorOptions, sub.argv)
    } else {
      const util = require('../util')
      let options = constructorOptions

      /* if the command defines command-line options, parse them */
      if (this.optionDefinitions) {
        if (this.getOptions) {
          options = this.getOptions(constructorOptions, argv)
        } else {
          const commandLineArgs = require('command-line-args')
          const commandCliOptions = commandLineArgs(this.optionDefinitions(), { argv })
          options = util.deepMerge({}, constructorOptions, commandCliOptions)
        }
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
