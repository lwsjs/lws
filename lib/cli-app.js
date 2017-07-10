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
      return cliApp.start()
    } catch (err) {
      const util = require('./util')
      util.printError(err)
      const usage = require('./usage')
      usage.exception({ exd: err.message, hitParams: { cd: 'listen' } })
      usage.exception({ exd: err.stack, hitParams: { cd: 'listen-stack' } })
      usage.send().catch(err => { /* disregard errors */ })
    }
  }
}

module.exports = CliApp
