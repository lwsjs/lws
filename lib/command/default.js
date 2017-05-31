class DefaultCommand {
  optionDefinitions () {
    return {
      name: 'help',
      alias: 'h',
      type: Boolean,
      description: 'Print these usage instructions.'
    }
  }
  execute (options) {
    if (options.help) {
      const HelpCommand = require('./help')
      const cmd = new HelpCommand()
      cmd._commands = this._commands
      return cmd.execute()
    }
  }
}

module.exports = DefaultCommand
