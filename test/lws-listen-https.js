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
  class One {
    middleware (options) {
      return (ctx, next) => {
        ctx.body = 'one'
        next()
      }
    }
  }
  const lws = Lws.create({
    stack: [ One ],
    https: true,
    port: port
  })
  const response = await fetch(`https://localhost:${port}`, { agent })
  lws.server.close()
  a.strictEqual(response.status, 200)
  const body = await response.text()
  a.strictEqual(body, 'one')
})

tom.test('--key and --cert', async function () {
  const port = 9200 + this.index
  class One {
    middleware (options) {
      return (ctx, next) => {
        ctx.body = 'one'
        next()
      }
    }
  }
  const lws = Lws.create({
    stack: [ One ],
    key: 'ssl/private-key.pem',
    cert: 'ssl/lws-cert.pem',
    port: port
  })
  const response = await fetch(`https://localhost:${port}`, { agent })
  lws.server.close()
  a.strictEqual(response.status, 200)
  const body = await response.text()
  a.strictEqual(body, 'one')
})

tom.test('--pfx', async function () {
  const port = 9200 + this.index
  class One {
    middleware (options) {
      return (ctx, next) => {
        ctx.body = 'one'
        next()
      }
    }
  }
  const lws = Lws.create({
    stack: [ One ],
    pfx: 'ssl/lws.pfx',
    port: port
  })
  const response = await fetch(`https://localhost:${port}`, { agent })
  lws.server.close()
  a.strictEqual(response.status, 200)
  const body = await response.text()
  a.strictEqual(body, 'one')
})

tom.test('--pfx, --max-connections, --keep-alive-timeout', async function () {
  const port = 9200 + this.index
  class One {
    middleware (options) {
      return (ctx, next) => {
        ctx.body = 'one'
        next()
      }
    }
  }
  const lws = Lws.create({
    stack: [ One ],
    pfx: 'ssl/lws.pfx',
    port: port,
    maxConnections: 11,
    keepAliveTimeout: 10001
  })
  a.strictEqual(lws.server.keepAliveTimeout, 10001)
  a.strictEqual(lws.server.maxConnections, 11)
  const response = await fetch(`https://localhost:${port}`, { agent })
  lws.server.close()
  a.strictEqual(response.status, 200)
  const body = await response.text()
  a.strictEqual(body, 'one')
})
