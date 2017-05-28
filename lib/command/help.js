const Command = require('./command')

class HelpCommand extends Command {
  optionDefinitions () {
    return { name: 'command', defaultOption: true }
  }

  description () {
    return 'Show help for a command.'
  }

  usage () {
    return [
      {
        header: 'lws help',
        content: 'Show help for a command.'
      }
    ]
  }

  mainUsage () {
    return [
      {
        header: 'lws',
        content: 'A modular server application shell for creating a personalised local web server to support productive, full-stack Javascript development.'
      },
      {
        header: 'Synopsis',
        content: [
          '$ lws [underline]{command} <options>'
        ]
      },
      {
        header: 'Commands',
        content: Array.from(this._commands)
          .map(([name, command]) => ({ name: name, desc: command.description && command.description() }))
      },
      {
        content: 'Project home: [underline]{https://github.com/lwsjs/lws}'
      }
    ]
  }

  execute (options) {
    const commandLineUsage = require('command-line-usage')
    console.error(commandLineUsage(this.mainUsage()))
    process.exit(0)
  }
}

module.exports = HelpCommand
