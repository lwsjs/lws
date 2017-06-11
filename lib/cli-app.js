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
    const lws = new this()
    try {
      lws.start()
    } catch (err) {
      const util = require('./util')
      util.printError(err)
    }
  }
}

module.exports = CliApp
