import TestRunner from 'test-runner'
import assert from 'assert'
import Lws from '../index.mjs'
import fetch from 'node-fetch'

const a = assert.strict
const tom = new TestRunner.Tom()

tom.test('No middleware', async function () {
  const port = 9800 + this.index
  const lws = await Lws.create({ port })
  const response = await fetch(`http://localhost:${port}/`)
  lws.server.close()
  a.equal(response.status, 404)
})

tom.test('empty stack array', async function () {
  const port = 9800 + this.index
  const lws = await Lws.create({ port, stack: [] })
  const response = await fetch(`http://localhost:${port}/`)
  lws.server.close()
  a.equal(response.status, 404)
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
  const lws = await Lws.create({
    port,
    stack: One
  })
  const response = await fetch(`http://localhost:${port}/`)
  lws.server.close()
  a.equal(response.status, 200)
  const body = await response.text()
  a.equal(body, 'one')
})

tom.test('middleware args', async function () {
  const port = 9800 + this.index
  const actuals = []
  class One {
    middleware (config, lws) {
      actuals.push(config, lws)
    }
  }
  const lws = await Lws.create({
    port,
    stack: One
  })
  lws.server.close()
  a.equal(actuals[0].port, port)
  a.equal(actuals[1], lws)
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
  const lws = await Lws.create({
    port,
    stack: [One, Two]
  })
  const response = await fetch(`http://localhost:${port}`)
  lws.server.close()
  const body = await response.text()
  a.equal(body, 'onetwo')
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
  const lws = await Lws.create({
    port,
    stack: One
  })
  const response = await fetch(`http://localhost:${port}/`)
  lws.server.close()
  a.equal(response.status, 500)
})

tom.test('Load one middleware', async function () {
  const port = 9800 + this.index
  const lws = await Lws.create({
    port,
    stack: 'lws-static'
  })
  const response = await fetch(`http://localhost:${port}/package.json`)
  lws.server.close()
  a.equal(response.status, 200)
})

tom.test('Invalid middleware: wrong type', async function () {
  const port = 9800 + this.index
  const One = false
  await a.rejects(
    () => {
      return Lws.create({
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
  await a.rejects(
    () => {
      return Lws.create({
        port,
        stack: One
      })
    },
    /Invalid middleware/
  )
})

tom.test('Invalid middleware: loaded, no middleware method', async function () {
  const port = 9800 + this.index
  await a.rejects(
    () => {
      return Lws.create({
        port,
        stack: 'test/fixture/invalid.mjs'
      })
    },
    /Invalid middleware/
  )
})

export default tom
