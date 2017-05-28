const Command = require('./command')

class ShowCommand extends Command {
  description () {
    return 'Print information'
  }
  usage () {
    return [
      {
        header: 'lws show',
        content: this.description()
      }
    ]
  }

  subCommands () {
    const Commands = require('../commands')
    const commands = new Commands()
    commands.set('version', require('./show-version').create())
    return commands
  }
}

module.exports = ShowCommand
