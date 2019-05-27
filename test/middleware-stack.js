const Tom = require('test-runner').Tom
const a = require('assert')
const MiddlewareStack = require('../lib/middleware-stack')
const EventEmitter = require('events')

const tom = module.exports = new Tom('middleware-stack')

tom.test('from', async function () {
  class One {}
  const stack = MiddlewareStack.from([ One ])
  a.strictEqual(stack[0].constructor.name, 'One')
})

tom.test('propagate verbose events', async function () {
  class One extends EventEmitter {}
  const stack = MiddlewareStack.from([ One ])
  const one = stack[0]
  const actuals = []
  stack.on('verbose', () => actuals.push('ok'))
  stack.on('not-propagated', () => actuals.push('no'))
  one.emit('verbose')
  one.emit('not-propagated')
  a.deepStrictEqual(actuals, [ 'ok' ])
})

tom.test('get middleware functions', async function () {
  class One {
    middleware (options) {
      return function oneMiddleware () { return options.one }
    }
  }
  class Two {
    middleware () {
      // empty
    }
  }
  const stack = MiddlewareStack.from([ One, Two ])
  const middlewares = stack.getMiddlewareFunctions({ one: 1 })
  a.strictEqual(middlewares.length, 1)
  a.strictEqual(middlewares[0].name, 'oneMiddleware')
  a.strictEqual(middlewares[0](), 1)
})

tom.test('from: class and module', async function () {
  class One {}
  const stack = MiddlewareStack.from([ One, 'test/fixture/middleware.js' ])
  a.strictEqual(stack.length, 2)
  a.strictEqual(stack[0].constructor.name, 'One')
  a.strictEqual(stack[1].constructor.name, 'Two')
})
