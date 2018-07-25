class CliApp {
  constructor (options) {
    const Commands = require('cli-commands')
    this.commands = new Commands()
    this.commands.add(null, require('./command/serve'))
  }

  start () {
    return this.commands.start()
  }

  static run () {
    const cliApp = new this()
    try {
      const server = cliApp.start()
      if (server) {
        server.on('error', err => {
          this.printError(err)
        })
      }
      return server
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
