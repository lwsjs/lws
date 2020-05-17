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
        name: 'qr',
        type: String,
        description: 'Enables you to quickly launch your web app in a mobile browser by scanning a QR code. The QR code for the URL of the specified network interface (e.g. `--qr en0`) is printed. If no interface is specified (`--qr`) it defaults to printing a QR for the first found private address (e.g. `192.168.0.1`). See `--list-network-interfaces` for a list of your current network interface names.',
        typeLabel: '{underline network interface}'
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

  printListeningMsg (ipList) {
    const ansi = require('ansi-escape-sequences')
    ipList = ipList
      .map(iface => ansi.format(iface.url, 'underline'))
      .join(', ')
    _log.get(this)(`Listening on ${ipList}`)
  }

  getSortedPrivateAddresses (ipList) {
    return ipList.slice().sort((a, b) => {
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
  }

  resolvePrivateAddress (ipList) {
    if (!ipList || ipList.length === 0) {
      _logError.get(this)('Warning: no network interfaces provided to resolve private Address.')
      return null
    }

    const sortedAddresses = this.getSortedPrivateAddresses(ipList)
    if (sortedAddresses[0].address && sortedAddresses[0].name) {
      return sortedAddresses[0]
    }

    _logError.get(this)(`Warning: network interface found does not have a valid IP address or name: ${JSON.stringify(sortedAddresses[0])}`)
    return null
  }

  printAddressQRCode (iface, ipList) {
    const log = _log.get(this)
    if (!ipList || ipList.length === 0) {
      _logError.get(this)('Warning: no available network interfaces to print QRCode.')
      return
    }

    const qrcode = require('qrcode-terminal')
    const ansi = require('ansi-escape-sequences')
    if (iface) {
      const selectedIface = ipList.find(ip => ip.name === iface)
      if (selectedIface) {
        log(`\nQR code for ${ansi.format(selectedIface.url, 'underline')}:`)
        qrcode.generate(selectedIface.url, { small: true }, log)
      } else {
        throw new Error(`QR: Unknown network interface: '${iface}'`)
      }
    } else { // if not provided, search for default address, in order of: 192.x, 172.x, 10.x
      const privateAddress = this.resolvePrivateAddress(ipList)
      if (privateAddress) {
        log(`\nQR code for ${ansi.format(privateAddress.url, 'underline')}:`)
        qrcode.generate(privateAddress.url, { small: true }, log)
      } else {
        throw new Error(`QR: Could not find a default network interface`)
      }
    }
  }

  write (key, value, config = {}) {
    if (key === 'middleware.error') {
      const { printError } = require('../util')
      printError(value, 'Middleware error', _logError.get(this))
    } else if (key === 'server.listening') {
      this.printListeningMsg(value)
      if (config.qr === null || config.qr) {
        this.printAddressQRCode(config.qr, value)
      }
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
