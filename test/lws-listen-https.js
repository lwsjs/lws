import assert from 'assert'
import Lws from 'lws'
import fetch from 'node-fetch'
import https from 'https'
const agent = new https.Agent({
  rejectUnauthorized: false
})

const a = assert.strict
const test = new Map()

test.set('--https', async function () {
  const port = 9201
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
    https: true,
    port
  })
  try {
    const response = await fetch(`https://localhost:${port}`, { agent })
    a.equal(response.status, 200)
    const body = await response.text()
    a.equal(body, 'one')
  } finally {
    lws.server.close()
  }
})

test.set('--key and --cert', async function () {
  const port = 9202
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
    key: 'ssl/private-key.pem',
    cert: 'ssl/lws-cert.pem',
    port
  })
  try {
    const response = await fetch(`https://localhost:${port}`, { agent })
    a.equal(response.status, 200)
    const body = await response.text()
    a.equal(body, 'one')
  } finally {
    lws.server.close()
  }
})

test.set('--pfx', async function () {
  const port = 9203
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
    pfx: 'ssl/lws.pfx',
    port
  })
  try {
    const response = await fetch(`https://localhost:${port}`, { agent })
    a.equal(response.status, 200)
    const body = await response.text()
    a.equal(body, 'one')
  } finally {
    lws.server.close()
  }
})

test.set('--pfx, --max-connections, --keep-alive-timeout', async function () {
  const port = 9204
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
    pfx: 'ssl/lws.pfx',
    port,
    maxConnections: 11,
    keepAliveTimeout: 10001
  })
  try {
    a.equal(lws.server.keepAliveTimeout, 10001)
    a.equal(lws.server.maxConnections, 11)
    const response = await fetch(`https://localhost:${port}`, { agent })
    a.equal(response.status, 200)
    const body = await response.text()
    a.equal(body, 'one')
  } finally {
    lws.server.close()
  }
})

export { test }
