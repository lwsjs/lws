module.exports = Superclass => class Command extends Superclass {
  start (options, argv) {
    /* start subcommand */
    if (this.subCommands) {
      const subCommands = this.subCommands()
      return subCommands.start(options, argv)

    /* if the command defines command-line options, parse them */
    } else {
      const util = require('./util')

      if (this.optionDefinitions) {
        if (this.getOptions) {
          options = this.getOptions(options, argv)
        } else {
          const commandLineArgs = require('command-line-args')
          const commandCliOptions = commandLineArgs(this.optionDefinitions(), { argv })
          options = util.deepMerge({}, options, commandCliOptions)
        }
      }

      /* merge options and execute */
      return this.execute(options)
    }
  }
}
