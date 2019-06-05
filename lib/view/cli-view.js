class CliView {
  constructor (options) {
    options = options || {}
    this.options = options
    this.events = []
    this.logError = options.logError || console.error
  }

  optionDefinitions () {
    return [
      {
        name: 'verbose',
        type: Boolean,
        alias: 'v',
        description: 'Outputs a highly verbose JSON stream containing debug information. Intended as a datasource for custom views.',
        section: 'core'
      },
      {
        name: 'verbose.include',
        multiple: true,
        description: 'One or more regular expressions describing which event keys to include in verbose output. Implies --verbose.'
      },
      {
        name: 'verbose.exclude',
        multiple: true,
        description: 'One or more regular expressions describing which event keys to exclude from verbose output. Implies --verbose.'
      }
    ]
  }

  printListeningMsg (ipList) {
    const ansi = require('ansi-escape-sequences')
    ipList = ipList
      .map(iface => ansi.format(iface, 'underline'))
      .join(', ')
    this.logError(`Listening at ${ipList}`)
  }

  write (key, value, options) {
    options = options || {}
    if (key === 'middleware.error') {
      const { printError } = require('../util')
      printError(value, 'Middleware error', options.logError)
    } else if (key === 'server.listening') {
      this.printListeningMsg(value)
    } else {
      if (options.verbose || options.verboseInclude || options.verboseExclude) {
        const verboseInclude = options.verboseInclude
        const verboseExclude = options.verboseExclude
        let printThis = true
        if (verboseInclude && verboseInclude.length) {
          printThis = verboseInclude.some(pickExpression => RegExp(pickExpression).test(key))
        }
        if (verboseExclude && verboseExclude.length) {
          printThis = !verboseExclude.some(pickExpression => RegExp(pickExpression).test(key))
        }
        if (printThis) {
          const util = require('util')
          const output = {}
          output[key] = value
          const log = options.log || console.log
          log(util.inspect(output, {
            depth: 6,
            colors: true,
            maxArrayLength: null
          }))
        }
      }
    }
  }
}

module.exports = CliView
