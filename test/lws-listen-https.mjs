import TestRunner from 'test-runner'
import assert from 'assert'
import Lws from '../index.mjs'
import fetch from 'node-fetch'
import url from 'url'
import fs from 'fs'
import https from 'https'
const agent = new https.Agent({
  rejectUnauthorized: false
})

const a = assert.strict
const tom = new TestRunner.Tom()

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
  const lws = await Lws.create({
    stack: [One],
    https: true,
    port: port
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
  const lws = await Lws.create({
    stack: [One],
    key: 'ssl/private-key.pem',
    cert: 'ssl/lws-cert.pem',
    port: port
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
  const lws = await Lws.create({
    stack: [One],
    pfx: 'ssl/lws.pfx',
    port: port
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
  const lws = await Lws.create({
    stack: [One],
    pfx: 'ssl/lws.pfx',
    port: port,
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

export default tom
