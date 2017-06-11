'use strict'
const TestRunner = require('test-runner')
const HttpsServer = require('../lib/https-server')(require('../lib/server'))
const a = require('assert')
const request = require('req-then')

const runner = new TestRunner()

runner.test('https', async function () {
  const port = 9200 + this.index
  class One {
    middleware (options) {
      return (ctx, next) => {
        ctx.body = 'one'
        next()
      }
    }
  }
  const server = new HttpsServer()
  server.launch({
    stack: [ One ],
    https: true,
    port: port
  })
  const url = require('url')
  const reqOptions = url.parse(`https://127.0.0.1:${port}`)
  reqOptions.rejectUnauthorized = false
  const response = await request(reqOptions)
  server.server.close()
  a.strictEqual(response.res.statusCode, 200)
  a.strictEqual(response.data.toString(), 'one')
})
