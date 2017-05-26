const Command = require('./command')

class ShowVersionCommand extends Command {
  usage () {
    return [
      {
        header: 'lws show version',
        content: 'Print the version number.'
      }
    ]
  }

  execute (options) {
    const path = require('path')
    const pkg = require(path.resolve(__dirname, '..', '..', 'package.json'))
    console.error(pkg.version)
  }

  description () {
    return 'Show help for a command.'
  }
}

module.exports = ShowVersionCommand
