'use strict'
const path = require('path')
const flatten = require('reduce-flatten')
const arrayify = require('array-back')

/**
 * @module util
 */

exports.parseCommandLineOptions = parseCommandLineOptions
exports.loadFeature = loadFeature
exports.loadModule = loadModule
exports.getIPList = getIPList
exports.getOptionDefinitions = getOptionDefinitions
exports.expandStack = expandStack
exports.deepMerge = deepMerge

/**
 * Return commandLineArgs output. Expand stack too.
 */
function parseCommandLineOptions () {
  const commandLineArgs = require('command-line-args')
  const cli = require('./cli-data')
  let optionDefinitions = cli.optionDefinitions
  let options = commandLineArgs(optionDefinitions, { partial: true })
  if (options._all.stack && options._all.stack.length) {
    options._all.stack = expandStack(options._all.stack)
    const stackDefinitions = getOptionDefinitions(options._all.stack)
    optionDefinitions = [ ...optionDefinitions, ...stackDefinitions ]
    options = commandLineArgs(optionDefinitions)
  } else {
    options = commandLineArgs(optionDefinitions)
  }
  return { options, optionDefinitions }
}

/**
 * Load a module and verify it's of the correct type
 * @returns {Feature}
 */
function loadFeature (modulePath) {
  const isModule = module => module.prototype && (module.prototype.middleware || module.prototype.stack || module.prototype.ready || true)
  if (isModule(modulePath)) return modulePath
  const module = loadModule(modulePath)
  if (module) {
    if (!isModule(module)) {
      const insp = require('util').inspect(module, { depth: 3, colors: true })
      const msg = `Not valid Middleware at: ${insp}`
      console.error(msg)
      process.exit(1)
    }
  } else {
    const msg = `No module found for: ${modulePath}`
    console.error(msg)
    process.exit(1)
  }
  return module
}

/**
 * Returns a module, loaded by the first to succeed from
 * - direct path
 * - 'node_modules/local-web-server-' + path, from current folder upward
 * - 'node_modules/' + path, from current folder upward
 * - also search local-web-server project node_modules? (e.g. to search for a feature module without need installing it locally)
 * @returns {object}
 */
function loadModule (modulePath) {
  let module
  const tried = []
  if (modulePath) {
    try {
      tried.push(path.resolve(modulePath))
      module = require(path.resolve(modulePath))
    } catch (err) {
      if (!(err && err.code === 'MODULE_NOT_FOUND')) {
        throw err
      }
      const walkBack = require('walk-back')
      const foundPath = walkBack(process.cwd(), path.join('node_modules', 'local-web-server-' + modulePath))
      tried.push('local-web-server-' + modulePath)
      if (foundPath) {
        module = require(foundPath)
      } else {
        const foundPath2 = walkBack(process.cwd(), path.join('node_modules', modulePath))
        tried.push(modulePath)
        if (foundPath2) {
          module = require(foundPath2)
        } else {
          const foundPath3 = walkBack(path.resolve(__filename, '..'), path.join('node_modules', 'local-web-server-' + modulePath))
          if (foundPath3) {
            return require(foundPath3)
          } else {
            const foundPath4 = walkBack(path.resolve(__filename, '..'), path.join('node_modules', modulePath))
            if (foundPath4) {
              return require(foundPath4)
            }
          }
        }
      }
    }
  }
  return module
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

/**
 * Grouped 'middleware'.
 * @return {OptionDefinition[]}
 */
function getOptionDefinitions (stack) {
  return arrayify(stack)
    .map(Feature => new Feature(this))
    .filter(feature => feature.optionDefinitions)
    .map(feature => feature.optionDefinitions())
    .reduce(flatten, [])
    .filter(def => def)
    .map(def => {
      def.group = 'middleware'
      return def
    })
}

function expandStack (stack) {
  if (stack && stack.length) {
    stack.forEach((featurePath, index) => {
      if (typeof featurePath === 'string') {
        stack[index] = loadFeature(featurePath)
      }
    })
    return stack
  }
}

function deepMerge (...args) {
  const assignWith = require('lodash.assignwith')
  const t = require('typical')

  function customiser (objValue, srcValue) {
    // console.log('--', arguments)
    if (t.isPlainObject(objValue) && t.isPlainObject(srcValue)) {
      return assignWith(objValue, srcValue, customiser)
    } else if (Array.isArray(objValue) && Array.isArray(srcValue)) {
      for (const value of srcValue) {
        objValue.push(value)
      }
    }
  }

  return assignWith(...args, customiser)
}
