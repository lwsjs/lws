class ConfigCommand {
  usage () {
    return [
      {
        header: 'lws config',
        content: 'Show the active config.'
      }
    ]
  }

  execute (options) {
    for (const prop in options) {
      if (Array.isArray(options[prop]) && !options[prop].length) {
        delete options[prop]
      }
    }
    console.error(require('util').inspect(options, { depth: 6, colors: true }))
  }
}

module.exports = ConfigCommand
