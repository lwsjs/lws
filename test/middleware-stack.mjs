import TestRunner from 'test-runner'
import assert from 'assert'
import EventEmitter from 'events'
import MiddlewareStack from 'lws/lib/middleware-stack.mjs'

const a = assert.strict
const tom = new TestRunner.Tom()

tom.test('from', async function () {
  class One {
    middleware () {}
  }
  const stack = await MiddlewareStack.from([One])
  a.equal(stack[0].constructor.name, 'One')
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
  const stack = await MiddlewareStack.from([One, Two])
  const middlewares = stack.getMiddlewareFunctions({ one: 1 })
  a.equal(middlewares.length, 1)
  a.equal(middlewares[0].name, 'oneMiddleware')
  a.equal(middlewares[0](), 1)
})

tom.test('from: class and module', async function () {
  class One {
    middleware () {}
  }
  const stack = await MiddlewareStack.from([One, 'test/fixture/middleware.mjs'])
  a.equal(stack.length, 2)
  a.equal(stack[0].constructor.name, 'One')
  a.equal(stack[1].constructor.name, 'Two')
})

tom.test('events propagated from middleware functions to stack', async function () {
  const actuals = []
  class One extends EventEmitter {
    middleware () {
      this.emit('verbose', 'one', 'two')
    }
  }
  const stack = await MiddlewareStack.from([One, 'test/fixture/middleware.mjs'])
  stack.on('verbose', (key, value) => {
    actuals.push(key, value)
  })
  stack.getMiddlewareFunctions()
  a.deepEqual(actuals, ['one', 'two', 'test', 'test'])
})

export default tom
