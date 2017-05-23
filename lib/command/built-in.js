class BuiltInCommand {
  optionDefinitions () {
    return [
      {
        name: 'help',
        alias: 'h',
        type: Boolean,
        description: 'Print these usage instructions.'
      },
      {
        name: 'config-file',
        alias: 'c',
        type: String,
        description: 'Config filename to use, defaults to "lws.config.js".',
        typeLabel: '[underline]{file}'
      }
    ]
  }

  execute (options) {
    if (options.version) {
      console.error(this.getVersion())
      process.exit(0)

      /* --help */
    } else if (options.help) {
      const commandLineUsage = require('command-line-usage')
      console.error(commandLineUsage(this.usage()))
      process.exit(0)
    }
  }

  /**
   * Returns version number, subclasses should override.
   * @returns {string}
   * @ignore
   */
  getVersion () {
    const path = require('path')
    const pkg = require(path.resolve(__dirname, '..', '..', 'package.json'))
    return pkg.version
  }

}

module.exports = BuiltInCommand
