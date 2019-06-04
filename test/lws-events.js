const Tom = require('test-runner').Tom
const a = require('assert')
const Lws = require('../index')
const fetch = require('node-fetch')
const sleep = require('sleep-anywhere')
const EventEmitter = require('events')

const tom = module.exports = new Tom('events')

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
  lws.useMiddlewareStack()
  lws.server.close()
  a.deepStrictEqual(actuals, [
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
  lws.useMiddlewareStack()
  lws.server.listen(port)
  await sleep(10)
  lws.server.close()
  await sleep(10)
  a.deepStrictEqual(actuals, [ 'server.listening', 'server.close' ])
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
  lws.useMiddlewareStack()
  lws.server.listen(port)
  await sleep(10)
  lws.server.close()
  await sleep(10)
  a.deepStrictEqual(actuals, [ 'something.test' ])
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
  const lws = Lws.create({ port, stack: One })
  lws.on('verbose', (key, value) => {
    actuals.push(key)
  })
  await fetch(`http://127.0.0.1:${port}`)
  lws.server.close()
  a.ok(actuals.includes('something.test'))
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
  const lws = Lws.create({ port, stack: One, view: new View() })
  await sleep(10)
  lws.server.close()
  await sleep(10)
  a.deepStrictEqual(actuals[0], { key: 'something.test', value: 1 })
})

tom.test('view receives verbose events, input MiddlewareStack instance', async function () {
  const MiddlewareStack = require('../lib/middleware-stack')
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
  const stack = MiddlewareStack.from([ One ])
  const lws = Lws.create({ port, stack, view: new View() })
  await sleep(10)
  lws.server.close()
  await sleep(10)
  a.deepStrictEqual(actuals[0], { key: 'something.test', value: 1 })
})
