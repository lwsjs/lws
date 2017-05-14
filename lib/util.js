'use strict'
const path = require('path')
const flatten = require('reduce-flatten')
const arrayify = require('array-back')

/**
 * @module util
 */

exports.parseCommandLineOptions = parseCommandLineOptions
exports.loadModule = loadModule
exports.getIPList = getIPList
exports.deepMerge = deepMerge

/**
 * Return commandLineArgs output. Expand stack too.
 * @return {{options: object, optionDefinitions: object[]}}
 */
function parseCommandLineOptions (existingDefs, mainOptions) {
  /* pass in the optionDefinitions supplied in the constructor options */
  const commandLineArgs = require('command-line-args')
  const builtInDefs = require('./cli-data').optionDefinitions
  const Stack = require('./stack')
  const includingExistingDefs = [ ...builtInDefs, ...existingDefs || [] ]
  let options = commandLineArgs(includingExistingDefs, { partial: true })
  /* look for the --stack option and load supplied features */
  const cliStack = Stack.create(options._all.stack)
  if (cliStack && cliStack.length) {
    cliStack.expand(mainOptions)
    const cliStackDefs = cliStack.getOptionDefinitions()
    const existingAndCliDefs = [ ...builtInDefs, ...cliStackDefs ]
    options = commandLineArgs(existingAndCliDefs)
    if (options._all.stack) {
      options._all.stack = Stack.create(options._all.stack)
      options._all.stack.expand(mainOptions)
    } else {
      options._all.stack = []
    }
    return { options, optionDefinitions: existingAndCliDefs }
  } else {
    options = commandLineArgs(includingExistingDefs)
    return { options, optionDefinitions: includingExistingDefs }
  }
}

function loadModule (modulePath, options) {
  options = Object.assign({ prefix: '' }, options)
  let result
  if (options['module-dir']) {
    const attempted = []
    for (const dir of arrayify(options['module-dir'])) {
      try {
        result = loadModule(path.resolve(dir, modulePath), { prefix: options.prefix })
        break
      } catch (err) {
        attempted.push(err.attempted)
      }
    }
    if (!result) {
      const err = new Error('module not found: ' + modulePath)
      err.code = 'MODULE_NOT_FOUND'
      err.attempted = attempted
      throw err
    }
  } else {
    const pathsToTry = [
      modulePath,
      path.resolve(path.dirname(modulePath), path.basename(modulePath))
    ]
    if (options.prefix) {
      pathsToTry.push(options.prefix + modulePath)
      pathsToTry.push(path.resolve(path.dirname(modulePath), options.prefix + path.basename(modulePath)))
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
    /* overwrite arrays */
    } else if (Array.isArray(previousValue) && Array.isArray(newValue) && newValue.length) {
      return newValue.slice()
    } else if (Array.isArray(previousValue) && Array.isArray(newValue) && !newValue.length) {
      return previousValue.slice()
    } else if (!t.isDefined(previousValue) && Array.isArray(newValue)) {
      return newValue.slice()
    }
  }

  return assignWith(...args, customiser)
}
