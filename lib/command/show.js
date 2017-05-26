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
    const commands = new Map()
    commands.set(null, require('./show-version').create())
    commands.set('version', require('./show-version').create())
    commands.set('config', require('./show-config').create())
    return commands
  }

  execute (options) {
    console.log('show execute')
    console.error(require('util').inspect(options, { depth: 6, colors: true }))
  }
}

module.exports = ShowCommand
