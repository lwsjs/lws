'use strict'

/**
 * @module util
 */

exports.deepMerge = deepMerge
exports.camelCaseObject = camelCaseObject
exports.printError = printError
exports.getIPList = getIPList

function deepMerge (...args) {
  const assignWith = require('lodash.assignwith')
  const t = require('typical')

  function customiser (previousValue, newValue, key, object, source) {
    /* deep merge plain objects */
    if (t.isPlainObject(previousValue) && t.isPlainObject(newValue)) {
      return assignWith(previousValue, newValue, customiser)
    /* overwrite arrays if the new array has items */
    } else if (Array.isArray(previousValue) && Array.isArray(newValue) && newValue.length) {
      return newValue.slice()
    /* ignore incoming arrays if empty */
    } else if (Array.isArray(newValue) && !newValue.length) {
      return Array.isArray(previousValue) ? previousValue.slice() : previousValue
    } else if (!t.isDefined(previousValue) && Array.isArray(newValue)) {
      return newValue.slice()
    }
  }

  return assignWith(...args, customiser)
}

function camelCaseObject (object) {
  const camelCase = require('lodash.camelcase')
  for (const prop of Object.keys(object)) {
    const converted = camelCase(prop)
    if (converted !== prop) {
      object[converted] = object[prop]
      delete object[prop]
    }
  }
  return object
}

function printError (err, title) {
  const ansi = require('ansi-escape-sequences')
  const now = new Date()
  const time = now.toLocaleTimeString()
  if (title) console.error(ansi.format(`${time}: [underline red]{${title}}`))
  console.error(ansi.format(err.stack, 'red'))
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

  let ipList = Object.keys(os.networkInterfaces())
    .map(key => os.networkInterfaces()[key])
    .reduce(flatten, [])
    .filter(iface => iface.family === 'IPv4')
  ipList.unshift({ address: os.hostname() })
  return ipList
}
