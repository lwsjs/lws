import assignWith from 'lodash.assignwith'
import * as t from 'typical'
import ansi from 'ansi-escape-sequences'
import os from 'os'
import walkBack from 'walk-back'

/**
 * @module util
 */

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

export function deepMerge (...args) {
  return assignWith(...args, customiser)
}

export function printError (err, title, log) {
  const now = new Date()
  const time = now.toLocaleTimeString()
  log = log || console.error
  if (title) {
    log(ansi.format(`${time}: [underline red]{${title}}`))
  }
  // console.log(log)
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
export function getIPList (boundHostname) {
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
export async function getStoredConfig (configFilePath) {
  const configFile = walkBack(process.cwd(), configFilePath || 'lws.config.js')
  return configFile ? (await import(configFile)).default : {}
}

export function propagate (eventName, from, to, toEventName) {
  from.on(eventName, function (...args) {
    to.emit(toEventName || eventName, ...args)
  })
}
