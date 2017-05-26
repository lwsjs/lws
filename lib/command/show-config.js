const Command = require('./command')

class ConfigCommand extends Command {
  usage () {
    return [
      {
        header: 'lws config',
        content: this.description()
      }
    ]
  }

  description () {
    return 'Show help for a command.'
  }

  execute (options) {
    console.error(require('util').inspect(options, { depth: 6, colors: true }))
  }
}

module.exports = ConfigCommand
