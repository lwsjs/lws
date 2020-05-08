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
 * [
 *   { name: 'hostname', address: 'mba4.local' },
 *   { name: 'lo0', address: '127.0.0.1' },
 *   { name: 'en0', address: '192.168.0.200' }
 * ]
 */
function getIPList (boundHostname) {
  const os = require('os')
  const output = []
  output.push({ name: 'hostname', address: boundHostname || os.hostname() })
  if (!boundHostname) {
    for (const name of Object.keys(os.networkInterfaces())) {
      for (const i of os.networkInterfaces()[name]) {
        if (i.family === 'IPv4') {
          output.push({
            name,
            address: i.address
          })
        }
      }
    }
  }
  return output
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
