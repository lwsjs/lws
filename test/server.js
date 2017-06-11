'use strict'
const TestRunner = require('test-runner')
const Server = require('../lib/server')
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
  const server = new Server()
  server.launch({
    stack: [ One ],
    port: port
  })
  const url = require('url')
  const response = await request(`http://127.0.0.1:${port}`)
  server.server.close()
  a.strictEqual(response.res.statusCode, 200)
  a.strictEqual(response.data.toString(), 'one')
})
