import assert from 'assert'
import Lws from 'lws'
import fetch from 'node-fetch'

const a = assert.strict
const test = new Map()

test.set('No middleware', async function () {
  const port = 9800
  const lws = await Lws.create({ port })
  const response = await fetch(`http://localhost:${port}/`)
  lws.server.close()
  a.equal(response.status, 404)
})

test.set('empty stack array', async function () {
  const port = 9801
  const lws = await Lws.create({ port, stack: [] })
  const response = await fetch(`http://localhost:${port}/`)
  lws.server.close()
  a.equal(response.status, 404)
})

test.set('One middleware', async function () {
  const port = 9802
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

test.set('middleware args', async function () {
  const port = 9803
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

test.set('Two middlewares', async function () {
  const port = 9804
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

test.set('Broken middleware', async function () {
  const port = 9805
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

test.set('Load one middleware', async function () {
  const port = 9806
  const lws = await Lws.create({
    port,
    stack: 'lws-static'
  })
  const response = await fetch(`http://localhost:${port}/package.json`)
  lws.server.close()
  a.equal(response.status, 200)
})

test.set('Invalid middleware: wrong type', async function () {
  const port = 9807
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

test.set('Invalid middleware: no middleware method', async function () {
  const port = 9808
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

test.set('Invalid middleware: loaded, no middleware method', async function () {
  const port = 9809
  await a.rejects(
    () => {
      return Lws.create({
        port,
        stack: 'test/fixture/invalid.js'
      })
    },
    /Invalid middleware/
  )
})

export { test }
