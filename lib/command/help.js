class HelpCommand {
  usage () {
    return [
      {
        header: 'lws help',
        content: 'Show help for a command.'
      }
    ]
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
          '$ lws [underline]{command} <options>',
        ]
      },
      {
        header: 'Commands',
        content: [
          { name: 'serve', desc: 'Launch server' },
          { name: 'show', desc: 'Print some info' },
          { name: 'help', desc: 'Get help' }
        ]
      },
      {
        content: 'Project home: [underline]{https://github.com/lwsjs/lws}'
      }
    ]
  }

  execute (options) {
    const commandLineUsage = require('command-line-usage')
    console.error(commandLineUsage(this.usage()))
    process.exit(0)
  }
}

module.exports = HelpCommand
