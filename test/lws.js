'use strict'
const TestRunner = require('test-runner')
const Lws = require('../')
const a = require('assert')
const request = require('req-then')

const runner = new TestRunner()

runner.test('http', async function () {
  const port = 9100 + this.index
  class One {
    middleware (options) {
      return (ctx, next) => {
        ctx.body = 'one'
        next()
      }
    }
  }
  const lws = new Lws({
    stack: [ One ],
    port: port
  })
  lws.launch()
  const url = require('url')
  const response = await request(`http://127.0.0.1:${port}`)
  lws.server.close()
  a.strictEqual(response.res.statusCode, 200)
  a.strictEqual(response.data.toString(), 'one')
})
