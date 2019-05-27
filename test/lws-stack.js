const Tom = require('test-runner').Tom
const a = require('assert')
const fetch = require('node-fetch')
const Lws = require('../index')

const tom = module.exports = new Tom('lws-stack')

tom.skip('One middleware', async function () {
  const lws = new Lws()
  const port = 9900 + this.index
  class One {
    middleware () {
      return function (ctx, next) {
        ctx.body = 'one'
      }
    }
  }
  const server = lws.listen({
    port,
    stack: One
  })
  const response = await fetch(`http://localhost:${port}/`)
  server.close()
  a.strictEqual(response.status, 200)
  const body = await response.text()
  a.strictEqual(body, 'one')
})

tom.test('empty stack', async function () {
  const lws = new Lws()
  const port = 9900 + this.index
  const server = lws.listen({ port })
  const response = await fetch(`http://localhost:${port}/`)
  server.close()
  a.strictEqual(response.status, 404)
})
