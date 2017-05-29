const t = require('typical')
const CommandMixin = require('./command-mixin')

class Commands extends Map {
  expand () {
    for (const [ name, cmd ] of this) {
      if (typeof cmd === 'string') {
        const Command = require(cmd)
        this.set(name, new Command())
      } else if (t.isClass(cmd)) {
        this.set(name, new cmd())
      }
    }
  }

  applyMixin () {
    for (const [name, Cmd] of this) {
      this.set(name, CommandMixin(Cmd))
    }
  }

  start (options) {
    this.applyMixin()

    /* parse command */
    const commandLineCommands = require('command-line-commands')
    let { command, argv } = commandLineCommands(Array.from(this.keys()))
    let Cmd = this.get(command)
    const cmd = new Cmd()
    cmd._commands = this

    return cmd.start(options, argv)
  }
}

module.exports = Commands
