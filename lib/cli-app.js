class CliApp {
  constructor (options) {
    const Commands = require('cli-commands')
    this.commands = new Commands()
    this.commands.add(null, require('./command/serve'))
  }

  start () {
    const usage = require('./usage')
    usage.defaults.set('cd4', 'cli')
    return this.commands.start()
  }

  static run () {
    const cliApp = new this()
    try {
      cliApp.start()
    } catch (err) {
      const util = require('./util')
      util.printError(err)
    }
  }
}

module.exports = CliApp
