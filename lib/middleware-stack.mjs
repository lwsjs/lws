import EventEmitter from 'events'
import mixInto from 'create-mixin'
import { loadModule } from 'load-module'

/**
 * Array of Middleware instances
 * @module stack
 */

class MiddlewareStack extends mixInto(EventEmitter)(Array) {
  /**
   * Returns an array of middleware functions
   * @returns {function[]}
   */
  getMiddlewareFunctions (config, lws) {
    return this
      .filter(mw => mw.middleware)
      .map(mw => mw.middleware(Object.assign({}, config), lws))
      .flat()
      .filter(mw => mw)
  }

  /**
   * @return {OptionDefinition[]}
   */
  getOptionDefinitions () {
    return this
      .filter(mw => mw.optionDefinitions)
      .map(mw => mw.optionDefinitions())
      .flat()
      .filter(def => def)
  }

  /**
   * @param {string[]|class[]} modules - Array of middleware classes or modules which export them.
   * @param [options] {object}
   * @param [options.paths] {string[]}
   * @return {Middleware[]}
   */
  static async from (modules = [], options = { paths: process.cwd() }) {
    const MiddlewareClasses = []
    for await (let moduleItem of modules) {
      /* load module */
      if (typeof moduleItem === 'string') {
        moduleItem = await loadModule(moduleItem, options)
      }
      /* validate module */
      if (typeof moduleItem === 'function' && moduleItem.prototype.middleware) {
        MiddlewareClasses.push(moduleItem)
      } else {
        throw new Error('Invalid middleware: please supply a class with a `middleware` method.')
      }
    }
    const stack = new this()
    for (const MiddlewareClass of MiddlewareClasses) {
      const middleware = new MiddlewareClass()
      stack.push(middleware)
      /* extending EventEmitter is optional */
      if (middleware.on) {
        middleware.on('verbose', (key, value) => stack.emit('verbose', key, value))
      }
    }
    return stack
  }
}

export default MiddlewareStack
