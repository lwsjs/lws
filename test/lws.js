'use strict'
const TestRunner = require('test-runner')
const Lws = require('../')
const a = require('assert')
const request = require('req-then')

const runner = new TestRunner()

runner.skip('--help', function () {
  const lws = new Lws()
  process.argv = [ 'node', 'script.js', '--help' ]
  // need to be able to pass in the output stream in order to test it
})

runner.test('general option precedence', function () {

})

runner.test('https', async function () {
  const port = 9100 + this.index
  class Feature {
    middleware (options) {
      return (ctx, next) => {
        ctx.body = 'one'
        next()
      }
    }
  }
  const lws = new Lws({
    stack: [ Feature ],
    https: true,
    port: port
  })
  lws.start()
  const url = require('url')
  const reqOptions = url.parse(`https://127.0.0.1:${port}`)
  reqOptions.rejectUnauthorized = false
  const response = await request(reqOptions)
  lws.server.close()
  a.strictEqual(response.res.statusCode, 200)
  a.strictEqual(response.data.toString(), 'one')
})
