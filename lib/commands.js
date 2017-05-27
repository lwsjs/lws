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
}

module.exports = Commands
