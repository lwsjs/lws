'use strict'
const TestRunner = require('test-runner')
const Lws = require('../')
const a = require('assert')
const request = require('req-then')
const usage = require('../lib/usage')
usage.disable()

const runner = new TestRunner()

runner.test('lws: simple http', async function () {
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
  const server = lws.create({
    stack: [ One ],
    port: port
  })
  const url = require('url')
  const response = await request(`http://127.0.0.1:${port}`)
  server.close()
  a.strictEqual(response.res.statusCode, 200)
  a.strictEqual(response.data.toString(), 'one')
})
