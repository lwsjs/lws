'use strict'
const path = require('path')
const arrayify = require('array-back')

/**
 * @module util
 */

exports.deepMerge = deepMerge

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
