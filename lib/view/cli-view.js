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
    _log.get(this)(`\nListening on ${ipList}\n`)
  }

  printNetworkInterfaces(ipList) {
    const ansi = require('ansi-escape-sequences')
    const interfaces = ipList.map(iface => `- ${ansi.format(iface.name, 'bold')}: ${iface.address}`).join("\n")
    _log.get(this)(`\n${ansi.format('Available network interfaces', 'underline')}\n${interfaces}\n`)
  }

  resolvePrivateAddress(ipList) {
    if (!ipList || ipList.length === 0) {
      _logError.get(this)(`Warning: no network interfaces provided to resolve private Address.`)
      return null
    }

    const sortedAddresses = ipList.sort((a, b) => {
      if (!a.address) {
        return 1
      }
      if (!b.address) {
        return -1
      }
      if (!a.name) {
        return 1
      }
      if (!b.name) {
        return -1
      }
      if (a.address.match(/(192\.168\.)/)) {
        return -1
      }
      if (b.address.match(/(^192\.168\.)/)) {
        return 1
      }
      if (a.address.match(/(^172\.1[6-9]\.)|(^172\.2[0-9]\.)|(^172\.3[0-1]\.)/)) {
        return -1
      }
      if (b.address.match(/(^172\.1[6-9]\.)|(^172\.2[0-9]\.)|(^172\.3[0-1]\.)/)) {
        return 1
      }
      if (a.address.match(/(^10\.)/)) {
        return -1
      }
      if (b.address.match(/(^10\.)/)) {
        return 1
      }
      return 0
    })

    if (sortedAddresses[0].address && sortedAddresses[0].name) {
      return sortedAddresses[0]
    }

    _logError.get(this)(`Warning: network interface found does not have a valid IP address or name: ${JSON.stringify(sortedAddresses[0])}`)
    return null

  }
  printAddressQRCode(iface, ipList) {
    if (!ipList || ipList.length === 0) {
      _logError.get(this)(`Warning: no available network interfaces to print QRCode.`)
      return
    }

    const qrcode = require('qrcode-terminal');
    if (iface) {
      const selectedIface = ipList.find(ip => ip.name === iface)
      if (selectedIface) {
        _log.get(this)(`\nScan this QR Code with your mobile device to easily get this server address`)
        qrcode.generate(selectedIface.url, { small: true })
        _log.get(this)(`QR Code URL: ${selectedIface.url}`)
      } else {
        _logError.get(this)(`Warning: uknown --qr network_interface '${iface}'. Ignoring QRCode output.`)
      }
    } else { //if not provided, search for default address, in order of: 192.x, 172.x, 10.x
      const privateAddress = this.resolvePrivateAddress(ipList)
      if (privateAddress) {
        _log.get(this)(`\nScan this QR Code with your mobile device to easily get this server address`)
        qrcode.generate(privateAddress.url, { small: true })
        _log.get(this)(`QR Code URL: ${privateAddress.url}`)
      } else {
        _logError.get(this)(`Warning: could not find a network interface to print the QRCode`)
      }
    }
  }

  write(key, value, config = {}) {
    if (key === 'middleware.error') {
      const { printError } = require('../util')
      printError(value, 'Middleware error', _logError.get(this))
    } else if (key === 'server.listening') {
      if (config.listNetworkInterfaces) {
        this.printNetworkInterfaces(value)
      }
      if (config.qr === null || config.qr) {
        this.printAddressQRCode(config.qr, value)
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
