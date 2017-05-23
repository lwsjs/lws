class VersionCommand {
  usage () {
    return [
      {
        header: 'lws version',
        content: 'Print the version number.'
      }
    ]
  }

  execute (options) {
    const path = require('path')
    const pkg = require(path.resolve(__dirname, '..', '..', 'package.json'))
    console.error(pkg.version)
  }
}

module.exports = VersionCommand
