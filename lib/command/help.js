class HelpCommand {
  optionDefinitions () {
    return { name: 'command', defaultOption: true }
  }

  description () {
    return 'Show help for a command.'
  }

  usage () {
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
    options = options || {}
    const commandLineUsage = require('command-line-usage')
    if (options.command) {
      const Cmd = this._commands.get(options.command)
      const cmd = new Cmd()
      console.error(commandLineUsage(cmd.usage()))
    } else {
      console.error(commandLineUsage(this.usage()))
    }
  }
}

module.exports = HelpCommand
