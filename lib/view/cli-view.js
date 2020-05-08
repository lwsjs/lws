const _log = new WeakMap()
const _logError = new WeakMap()

class CliView {
  /**
   * @param [options] {object}
   * @param [options.log] {function}
   * @param [options.logError] {function}
   */
  constructor(options = {}) {
    _log.set(this, options.log || console.log)
    _logError.set(this, options.logError || console.error)
  }

  optionDefinitions() {
    return [
      {
        name: 'list-network-interfaces',
        type: Boolean,
        description: 'Outputs a list of host\'s network interfaces.'
      },
      {
        name: 'qr',
        type: String,
        description: 'Outputs a QRCode with the network_interface listener address. If the network_interface arg is not provided, it will be defaulted to the first private address (IETF RFC1918) found among the network interfaces.',
        typeLabel: '{underline network_interface}'
      },
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

  printListeningMsg(ipList) {
    const ansi = require('ansi-escape-sequences')
    ipList = ipList
      .map(iface => ansi.format(iface.url, 'underline'))
      .join(', ')
    _logError.get(this)(`Listening on ${ipList}`)
  }

  printNetworkInterfaces(ipList) {
    const ansi = require('ansi-escape-sequences')
    const interfaces = ipList.map(iface => `- ${ansi.format(iface.name, 'bold')}: ${iface.address}`).join("\n")
    _logError.get(this)(`\n${ansi.format('Available network interfaces', 'underline')}\n${interfaces}\n`)
  }

  write(key, value, config = {}) {
    if (key === 'middleware.error') {
      const { printError } = require('../util')
      printError(value, 'Middleware error', _logError.get(this))
    } else if (key === 'server.listening') {
      if (config.listNetworkInterfaces) {
        this.printNetworkInterfaces(value)
      }
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
