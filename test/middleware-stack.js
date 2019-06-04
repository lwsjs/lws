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

tom.test('events propagated from middleware functions to stack', async function () {
  const actuals = []
  class One extends EventEmitter {
    middleware () {
      this.emit('verbose', 'one', 'two')
    }
  }
  const stack = MiddlewareStack.from([ One, 'test/fixture/middleware.js' ])
  stack.on('verbose', (key, value) => {
    actuals.push(key, value)
  })
  stack.getMiddlewareFunctions()
  a.deepStrictEqual(actuals, [ 'one', 'two', 'test', 'test' ])
})
