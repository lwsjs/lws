const Tom = require('test-runner').Tom
const Lws = require('../')
const a = require('assert')
const fetch = require('node-fetch')

const tom = module.exports = new Tom('https')

const https = require('https')
const agent = new https.Agent({
  rejectUnauthorized: false
})

tom.test('--https', async function () {
  const port = 9200 + this.index
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
    https: true,
    port: port
  })
  const response = await fetch(`https://127.0.0.1:${port}`, { agent })
  server.close()
  a.strictEqual(response.status, 200)
  const body = await response.text()
  a.strictEqual(body, 'one')
})

tom.test('--key and --cert', async function () {
  const port = 9200 + this.index
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
    key: 'ssl/private-key.pem',
    cert: 'ssl/lws-cert.pem',
    port: port
  })
  const response = await fetch(`https://127.0.0.1:${port}`, { agent })
  server.close()
  a.strictEqual(response.status, 200)
  const body = await response.text()
  a.strictEqual(body, 'one')
})

tom.test('--pfx', async function () {
  const port = 9200 + this.index
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
    pfx: 'ssl/lws.pfx',
    port: port
  })
  const response = await fetch(`https://127.0.0.1:${port}`, { agent })
  server.close()
  a.strictEqual(response.status, 200)
  const body = await response.text()
  a.strictEqual(body, 'one')
})

tom.test('--pfx, --max-connections, --keep-alive-timeout', async function () {
  const port = 9200 + this.index
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
    pfx: 'ssl/lws.pfx',
    port: port,
    maxConnections: 11,
    keepAliveTimeout: 10001
  })
  a.strictEqual(server.keepAliveTimeout, 10001)
  a.strictEqual(server.maxConnections, 11)
  const response = await fetch(`https://127.0.0.1:${port}`, { agent })
  server.close()
  a.strictEqual(response.status, 200)
  const body = await response.text()
  a.strictEqual(body, 'one')
})
