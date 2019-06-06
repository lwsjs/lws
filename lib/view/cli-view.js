const _log = new WeakMap()
const _logError = new WeakMap()

class CliView {
  /**
   * @param [options] {object}
   * @param [options.log] {function}
   * @param [options.logError] {function}
   */
  constructor (options = {}) {
    _log.set(this, options.log || console.log)
    _logError.set(this, options.logError || console.error)
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
    _logError.get(this)(`Listening on ${ipList}`)
  }

  write (key, value, config = {}) {
    if (key === 'middleware.error') {
      const { printError } = require('../util')
      printError(value, 'Middleware error', _logError.get(this))
    } else if (key === 'server.listening') {
      this.printListeningMsg(value)
    } else {
      if (config.verbose || config.verboseInclude || config.verboseExclude) {
        const verboseInclude = config.verboseInclude
        const verboseExclude = config.verboseExclude
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
          const log = _log.get(this)
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
