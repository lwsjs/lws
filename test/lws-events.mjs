import TestRunner from 'test-runner'
import assert from 'assert'
import Lws from 'lws'
import fetch from 'node-fetch'
import sleep from 'sleep-anywhere'
import EventEmitter from 'events'

const a = assert.strict
const tom = new TestRunner.Tom()

tom.test('server-factory config event', async function () {
  const port = 9930 + this.index
  const actuals = []
  const lws = new Lws({
    port,
    maxConnections: 11,
    keepAliveTimeout: 11
  })
  lws.on('verbose', (key, value) => {
    actuals.push(key, value)
  })
  lws.createServer()
  await lws.useMiddlewareStack()
  lws.server.close()
  a.deepEqual(actuals, [
    'server.config',
    {
      maxConnections: 11,
      keepAliveTimeout: 11
    }
  ])
})

tom.test('server.listening event', async function () {
  const port = 9930 + this.index
  const actuals = []
  const lws = new Lws({ port })
  lws.on('verbose', (key, value) => {
    actuals.push(key)
  })
  lws.createServer()
  lws._propagateServerEvents()
  await lws.useMiddlewareStack()
  lws.server.listen(port)
  await sleep(10)
  lws.server.close()
  await sleep(10)
  a.deepEqual(actuals, ['server.listening', 'server.close'])
})

tom.test('middleware plugin "verbose" event', async function () {
  const port = 9930 + this.index
  const actuals = []
  class One extends EventEmitter {
    middleware () {
      this.emit('verbose', 'something.test', 1)
    }
  }
  const lws = new Lws({ port, stack: One })
  lws.on('verbose', (key, value) => {
    actuals.push(key)
  })
  lws.createServer()
  await lws.useMiddlewareStack()
  lws.server.listen(port)
  await sleep(10)
  lws.server.close()
  await sleep(10)
  a.deepEqual(actuals, ['something.test'])
})

tom.test('ctx.app event', async function () {
  const port = 9930 + this.index
  const actuals = []
  class One {
    middleware () {
      return function (ctx) {
        ctx.app.emit('verbose', 'something.test')
      }
    }
  }
  const lws = await Lws.create({ port, stack: One })
  try {
    lws.on('verbose', (key, value) => {
      actuals.push(key)
    })
    await fetch(`http://127.0.0.1:${port}`)
    a.ok(actuals.includes('something.test'))
  } finally {
    lws.server.close()
  }
})

tom.test('view receives verbose events', async function () {
  const port = 9930 + this.index
  const actuals = []
  class One extends EventEmitter {
    middleware () {
      this.emit('verbose', 'something.test', 1)
    }
  }
  class View {
    write (key, value) {
      actuals.push({ key, value })
    }
  }
  const lws = await Lws.create({ port, stack: One, view: new View() })
  await sleep(10)
  lws.server.close()
  await sleep(10)
  a.deepEqual(actuals[0], { key: 'something.test', value: 1 })
})

tom.test('view receives verbose events, input MiddlewareStack instance', async function () {
  const MiddlewareStack = await import('../lib/middleware-stack.mjs').then(mod => mod.default)
  const port = 9930 + this.index
  const actuals = []
  class One extends EventEmitter {
    middleware () {
      this.emit('verbose', 'something.test', 1)
    }
  }
  class View {
    write (key, value) {
      actuals.push({ key, value })
    }
  }
  const stack = await MiddlewareStack.from([One])
  const lws = await Lws.create({ port, stack, view: new View() })
  await sleep(10)
  lws.server.close()
  await sleep(10)
  a.deepEqual(actuals[0], { key: 'something.test', value: 1 })
})

export default tom
