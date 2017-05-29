class ShowVersionCommand {
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
    console.log(pkg.version)
  }

  description () {
    return 'Show help for a command.'
  }
}

module.exports = ShowVersionCommand
