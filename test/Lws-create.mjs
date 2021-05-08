const Tom = require('test-runner').Tom
const a = require('assert').strict
const Lws = require('../index')
const fetch = require('node-fetch')

const tom = module.exports = new Tom()

tom.test('one middleware', async function () {
  const port = 9400 + this.index
  class One {
    middleware (options) {
      return (ctx, next) => {
        ctx.body = 'one'
        next()
      }
    }
  }
  const lws = Lws.create({
    stack: [One],
    port: port
  })
  const response = await fetch(`http://127.0.0.1:${port}`)
  lws.server.close()
  a.equal(response.status, 200)
  const body = await response.text()
  a.equal(body, 'one')
})
