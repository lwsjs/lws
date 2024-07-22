import assert from 'assert'
import Lws from 'lws'
import fetch from 'node-fetch'
import url from 'url'
import fs from 'fs'

const a = assert.strict
const test = new Map()

test.set('simple http', async function () {
  const port = 9101
  class One {
    middleware (options) {
      return (ctx, next) => {
        ctx.body = 'one'
        next()
      }
    }
  }
  const lws = await Lws.create({
    stack: [One],
    port
  })
  const response = await fetch(`http://127.0.0.1:${port}`)
  lws.server.close()
  a.equal(response.status, 200)
  const body = await response.text()
  a.equal(body, 'one')
})

test.set('hostname', async function () {
  const port = 9102
  class One {
    middleware (options) {
      return (ctx, next) => {
        ctx.body = fs.createReadStream('package.json')
        next()
      }
    }
  }
  const lws = await Lws.create({
    stack: [One],
    port,
    hostname: 'localhost'
  })

  try {
    await fetch(`http://127.0.0.1:${port}`)
    a.fail("shouldn't reach here")
  } catch (err) {
  }

  try {
    const response = await fetch(`http://localhost:${port}`)
    a.equal(response.status, 200)
    lws.server.close()
  } catch (err) {
    a.fail("shouldn't reach here")
  }
})

test.set('--max-connections, --keep-alive-timeout', async function () {
  const port = 9103
  class One {
    middleware (options) {
      return (ctx, next) => {
        ctx.body = 'one'
      }
    }
  }
  const lws = await Lws.create({
    stack: [One],
    port,
    maxConnections: 11,
    keepAliveTimeout: 10001
  })
  const server = lws.server
  a.equal(server.keepAliveTimeout, 10001)
  a.equal(server.maxConnections, 11)
  const reqOptions = new url.URL(`http://127.0.0.1:${port}`)
  reqOptions.rejectUnauthorized = false
  const response = await fetch(reqOptions)
  server.close()
  a.equal(response.status, 200)
  const body = await response.text()
  a.equal(body, 'one')
})

export { test }
