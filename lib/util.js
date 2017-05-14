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
function parseCommandLineOptions (defs, mainOptions) {
  /* pass in the optionDefinitions supplied in the constructor options */
  const commandLineArgs = require('command-line-args')
  const cli = require('./cli-data')
  let optionDefinitions = [ ...cli.optionDefinitions, ...defs || [] ]
  let options = commandLineArgs(optionDefinitions, { partial: true })
  if (options._all.stack && options._all.stack.length) {
    options._all.stack = expandStack(options._all.stack, mainOptions)
    const stackDefinitions = getOptionDefinitions(options._all.stack)
    optionDefinitions = [ ...cli.optionDefinitions, ...stackDefinitions ]
    options = commandLineArgs(optionDefinitions)
    options._all.stack = options._all.stack ? expandStack(options._all.stack, mainOptions) : []
  } else {
    options = commandLineArgs(optionDefinitions)
  }
  return { options, optionDefinitions }
}

/**
 * Load a module and verify it's of the correct type
 * @returns {Feature}
 */
function loadFeature (modulePath, options) {
  const isModule = module => module.prototype && (module.prototype.middleware || module.prototype.stack || module.prototype.ready || true)
  if (isModule(modulePath)) return modulePath
  const module = loadModule(modulePath, options)
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

function loadModule (modulePath, options) {
  options = Object.assign({ prefix: '' }, options)
  let result
  if (options.moduleDir) {
    for (const dir of arrayify(options.moduleDir)) {
      try {
        result = require(path.resolve(dir, options.prefix + modulePath))
        break
      } catch (err) {}
    }
  } else {
    result = require(options.prefix + modulePath)
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

function expandStack (stack, options) {
  if (stack && stack.length) {
    stack.forEach((featurePath, index) => {
      if (typeof featurePath === 'string') {
        stack[index] = loadFeature(featurePath, options)
      }
    })
    return stack
  } else {
    return []
  }
}

function deepMerge (...args) {
  const assignWith = require('lodash.assignwith')
  const t = require('typical')

  function customiser (objValue, srcValue, key, object, source) {
    if (t.isPlainObject(objValue) && t.isPlainObject(srcValue)) {
      return assignWith(objValue, srcValue, customiser)
    } else if (Array.isArray(objValue) && Array.isArray(srcValue)) {
      for (const value of srcValue) {
        objValue.push(value)
      }
      return objValue
    } else if (!t.isDefined(objValue) && Array.isArray(srcValue)) {
      return srcValue.slice()
    }
  }

  return assignWith(...args, customiser)
}
