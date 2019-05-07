const Tom = require('test-runner').Tom
const Lws = require('../')
const a = require('assert')
const fetch = require('node-fetch')
const sleep = require('sleep-anywhere')

const tom = module.exports = new Tom('http')

tom.test('simple http', async function () {
  const port = 9100 + this.index
  const One = Base => class extends Base {
    middleware (options) {
      return (ctx, next) => {
        ctx.body = 'one'
        next()
      }
    }
  }
  const lws = new Lws()
  const server = lws.listen({
    stack: [ One ],
    port: port
  })
  const response = await fetch(`http://127.0.0.1:${port}`)
  server.close()
  a.strictEqual(response.status, 200)
  const body = await response.text()
  a.strictEqual(body, 'one')
})

tom.test('hostname', async function () {
  const port = 9100 + this.index
  const One = Base => class extends Base {
    middleware (options) {
      return (ctx, next) => {
        const fs = require('fs')
        ctx.body = fs.createReadStream('package.json')
        next()
      }
    }
  }
  const lws = new Lws()
  const server = lws.listen({
    stack: [ One ],
    port: port,
    hostname: 'localhost'
  })

  try {
    await fetch(`http://127.0.0.1:${port}`)
    a.fail("shouldn't reach here")
  } catch (err) {
  }

  try {
    const response = await fetch(`http://localhost:${port}`)
    a.strictEqual(response.status, 200)
    server.close()
  } catch (err) {
    a.fail("shouldn't reach here")
  }
})

tom.test('--max-connections, --keep-alive-timeout', async function () {
  const port = 9100 + this.index
  const One = Base => class extends Base {
    middleware (options) {
      return (ctx, next) => {
        ctx.body = 'one'
        next()
      }
    }
  }
  const lws = new Lws()
  const server = lws.listen({
    stack: [ One ],
    port: port,
    maxConnections: 10,
    keepAliveTimeout: 10000
  })
  const url = require('url')
  const reqOptions = url.parse(`http://127.0.0.1:${port}`)
  reqOptions.rejectUnauthorized = false
  const response = await fetch(reqOptions)
  server.close()
  a.strictEqual(response.status, 200)
  const body = await response.text()
  a.strictEqual(body, 'one')
})
