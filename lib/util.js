'use strict'
const path = require('path')
const flatten = require('reduce-flatten')
const arrayify = require('array-back')

/**
 * @module util
 */

exports.loadModule = loadModule
exports.getIPList = getIPList
exports.deepMerge = deepMerge

const attempted = []
function loadModule (modulePath, options) {
  options = Object.assign({ 'module-prefix': '' }, options)
  options['module-dir'] = arrayify(options['module-dir'])
  let result
  if (options['module-dir'] && options['module-dir'].length) {
    for (const dir of arrayify(options['module-dir'])) {
      try {
        result = loadModule(path.resolve(dir, modulePath), { 'module-prefix': options['module-prefix'] })
        break
      } catch (err) {
        attempted.push(err.attempted)
      }
    }
    if (!result) {
      return loadModule(modulePath, { 'module-prefix': options['module-prefix'] })
    }
  } else {
    const pathsToTry = [
      modulePath,
      path.resolve(process.cwd(), modulePath),
      path.resolve(process.cwd(), 'node_modules', modulePath)
    ]
    if (options['module-prefix']) {
      pathsToTry.push(options['module-prefix'] + modulePath)
      pathsToTry.push(path.resolve(path.dirname(modulePath), options['module-prefix'] + path.basename(modulePath)))
      pathsToTry.push(path.resolve(path.dirname(modulePath), 'node_modules', options['module-prefix'] + path.basename(modulePath)))
    }
    for (const potentialPath of pathsToTry) {
      try {
        // console.error(potentialPath)
        result = require(potentialPath)
        break
      } catch (err) {}
    }
    if (!result) {
      const err = new Error(`module not found: ${modulePath}`)
      err.attempted = pathsToTry
      err.code = 'MODULE_NOT_FOUND'
      throw err
    }
  }
  return result
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

  let ipList = Object.keys(os.networkInterfaces())
    .map(key => os.networkInterfaces()[key])
    .reduce(flatten, [])
    .filter(iface => iface.family === 'IPv4')
  ipList.unshift({ address: os.hostname() })
  return ipList
}

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
