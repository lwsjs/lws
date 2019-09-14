/**
 * @module util
 */

function deepMerge (...args) {
  const assignWith = require('lodash.assignwith')
  const t = require('typical')

  function customiser (previousValue, newValue, key, object, source) {
    /* deep merge plain objects */
    if (t.isPlainObject(previousValue) && t.isPlainObject(newValue)) {
      return assignWith(previousValue, newValue, customiser)
    /* overwrite arrays if the new array has items */
    } else if (Array.isArray(previousValue) && Array.isArray(newValue) && newValue.length) {
      return newValue
    /* ignore incoming arrays if empty */
    } else if (Array.isArray(newValue) && !newValue.length) {
      return previousValue
    } else if (!t.isDefined(previousValue) && Array.isArray(newValue)) {
      return newValue
    }
  }

  return assignWith(...args, customiser)
}

function printError (err, title, log) {
  const ansi = require('ansi-escape-sequences')
  const now = new Date()
  const time = now.toLocaleTimeString()
  log = log || console.error
  if (title) log(ansi.format(`${time}: [underline red]{${title}}`))
  log(ansi.format(err.stack, 'red'))
}

/**
 * Returns an array of available IPv4 network interfaces
 * @example
 * [ { address: 'mbp.local' },
 *  { address: '127.0.0.1',
 *    netmask: '255.0.0.0',
 *    family: 'IPv4',
 *    mac: '00:00:00:00:00:00',
 *    internal: true },
 *  { address: '192.168.1.86',
 *    netmask: '255.255.255.0',
 *    family: 'IPv4',
 *    mac: 'd0:a6:37:e9:86:49',
 *    internal: false } ]
 */
function getIPList () {
  const os = require('os')
  const flatten = require('reduce-flatten')

  const ipList = Object.keys(os.networkInterfaces())
    .map(key => os.networkInterfaces()[key])
    .reduce(flatten, [])
    .filter(iface => iface.family === 'IPv4')
  ipList.unshift({ address: os.hostname() })
  return ipList
}

/**
 * Return stored config object.
 * @return {object}
 * @ignore
 */
function getStoredConfig (configFilePath) {
  const walkBack = require('walk-back')
  const configFile = walkBack(process.cwd(), configFilePath || 'lws.config.js')
  return configFile ? require(configFile) : {}
}

function propagate (eventName, from, to, toEventName) {
  from.on(eventName, function (...args) {
    to.emit(toEventName || eventName, ...args)
  })
}

exports.deepMerge = deepMerge
exports.printError = printError
exports.getIPList = getIPList
exports.getStoredConfig = getStoredConfig
exports.propagate = propagate
