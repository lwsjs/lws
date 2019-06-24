const Tom = require('test-runner').Tom
const a = require('assert')
const fetch = require('node-fetch')
const Lws = require('../index')

const tom = module.exports = new Tom('lws-stack')

tom.test('No middleware', async function () {
  const port = 9800 + this.index
  const lws = Lws.create({ port })
  const response = await fetch(`http://localhost:${port}/`)
  lws.server.close()
  a.strictEqual(response.status, 404)
})

tom.test('empty stack array', async function () {
  const port = 9800 + this.index
  const lws = Lws.create({ port, stack: [] })
  const response = await fetch(`http://localhost:${port}/`)
  lws.server.close()
  a.strictEqual(response.status, 404)
})

tom.test('One middleware', async function () {
  const port = 9800 + this.index
  class One {
    middleware () {
      return function (ctx, next) {
        ctx.body = 'one'
        next()
      }
    }
  }
  const lws = Lws.create({
    port,
    stack: One
  })
  const response = await fetch(`http://localhost:${port}/`)
  lws.server.close()
  a.strictEqual(response.status, 200)
  const body = await response.text()
  a.strictEqual(body, 'one')
})

tom.test('middleware args', async function () {
  const port = 9800 + this.index
  const actuals = []
  class One {
    middleware (config, lws) {
      actuals.push(config, lws)
    }
  }
  const lws = Lws.create({
    port,
    stack: One
  })
  lws.server.close()
  a.strictEqual(actuals[0].port, port)
  a.strictEqual(actuals[1], lws)
})

tom.test('Two middlewares', async function () {
  const port = 9800 + this.index
  class One {
    middleware (options) {
      return (ctx, next) => {
        ctx.body = 'one'
        next()
      }
    }
  }
  class Two {
    middleware (options) {
      return (ctx, next) => {
        ctx.body += 'two'
        next()
      }
    }
  }
  const lws = Lws.create({
    port,
    stack: [ One, Two ]
  })
  const response = await fetch(`http://localhost:${port}`)
  lws.server.close()
  const body = await response.text()
  a.strictEqual(body, 'onetwo')
})

tom.test('Broken middleware', async function () {
  const port = 9800 + this.index
  class One {
    middleware () {
      return function (ctx, next) {
        throw new Error('broken')
      }
    }
  }
  const lws = Lws.create({
    port,
    stack: One
  })
  const response = await fetch(`http://localhost:${port}/`)
  lws.server.close()
  a.strictEqual(response.status, 500)
})

tom.test('Load one middleware', async function () {
  const port = 9800 + this.index
  const lws = Lws.create({
    port,
    stack: 'lws-static'
  })
  const response = await fetch(`http://localhost:${port}/package.json`)
  lws.server.close()
  a.strictEqual(response.status, 200)
})

tom.test('Invalid middleware: wrong type', async function () {
  const port = 9800 + this.index
  const One = false
  a.throws(
    () => {
      Lws.create({
        port,
        stack: One
      })
    },
    /Invalid middleware/
  )
})

tom.test('Invalid middleware: no middleware method', async function () {
  const port = 9800 + this.index
  class One {}
  a.throws(
    () => {
      Lws.create({
        port,
        stack: One
      })
    },
    /Invalid middleware/
  )
})

tom.test('Invalid middleware: loaded, no middleware method', async function () {
  const port = 9800 + this.index
  a.throws(
    () => {
      Lws.create({
        port,
        stack: 'test/fixture/invalid.js'
      })
    },
    /Invalid middleware/
  )
})
