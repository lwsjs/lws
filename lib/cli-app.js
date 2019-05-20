class CliApp {
  constructor (options) {
    options = options || {}
    const Commands = require('./cli-commands')
    this.commands = new Commands()
    this.commands.add(null, require('./command/serve'), options)
    this.options = options
  }

  start () {
    return this.commands.start()
  }

  static run (options) {
    options = options || {}
    const cliApp = new this(options)
    try {
      const server = cliApp.start()
      if (server) {
        server.on('error', err => {
          this.printError(err, options.logError)
        })
      }
      return server
    } catch (err) {
      this.printError(err, options.logError)
      process.exitCode = 1
    }
  }

  static printError (err, logError) {
    const util = require('./util')
    util.printError(err, '', logError)
  }
}

module.exports = CliApp
