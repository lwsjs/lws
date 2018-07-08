class CliApp {
  constructor (options) {
    const Commands = require('cli-commands')
    this.commands = new Commands()
    this.commands.add(null, require('./command/serve'))
  }

  start () {
    const server = this.commands.start()
    if (server) {
      server.on('error', err => {
        this.constructor.printError(err)
      })
    }
    return server
  }

  static run () {
    const cliApp = new this()
    try {
      return cliApp.start()
    } catch (err) {
      this.printError(err)
      process.exitCode = 1
    }
  }

  static printError (err) {
    const util = require('./util')
    util.printError(err)
  }
}

module.exports = CliApp
