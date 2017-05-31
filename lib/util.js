'use strict'
const path = require('path')
const arrayify = require('array-back')

/**
 * @module util
 */

exports.loadModule = loadModule
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
