class HelpCommand {
  optionDefinitions () {
    return { name: 'command', defaultOption: true }
  }

  description () {
    return 'Show help for a command.'
  }

  execute (options) {
    options = options || {}
    const commandLineUsage = require('command-line-usage')
    if (options.command) {
      const Cmd = this._commands.get(options.command)
      const cmd = new Cmd()
      if (cmd && cmd.usage) {
        console.error(commandLineUsage(cmd.usage()))
      }
    } else {
      console.error(commandLineUsage(this._commands.get(null).usage()))
    }
  }
}

module.exports = HelpCommand
