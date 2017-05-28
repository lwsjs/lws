const t = require('typical')

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

  start (options) {
    /* parse command */
    const commandLineCommands = require('command-line-commands')
    let { command, argv } = commandLineCommands(Array.from(this.keys()))
    let cmd = this.get(command)

    return cmd.start(options, argv)
  }
}

module.exports = Commands
