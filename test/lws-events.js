const Tom = require('test-runner').Tom
const a = require('assert')
const Lws = require('../index')
const fetch = require('node-fetch')
const sleep = require('sleep-anywhere')

const tom = module.exports = new Tom('events')

tom.test('server-factory config event', async function () {
  const port = 9900 + this.index
  const actuals = []
  const lws = new Lws()
  lws.on('verbose', (key, value) => {
    actuals.push(key, value)
  })
  lws.createServer({
    port,
    maxConnections: 11,
    keepAliveTimeout: 11
  })
  lws.server.close()
  a.deepStrictEqual(actuals, [
    'server.config',
    {
      maxConnections: 11,
      keepAliveTimeout: 11
    }
  ])
})

tom.test('server.listening event', async function () {
  const port = 9900 + this.index
  const actuals = []
  const lws = new Lws()
  lws.on('verbose', (key, value) => {
    actuals.push(key)
  })
  lws.listen({ port })
  await sleep(10)
  lws.server.close()
  await sleep(10)
  a.deepStrictEqual(actuals, [ 'server.config', 'server.listening', 'server.close' ])
})

tom.test('middleware event', async function () {
  const port = 9900 + this.index
  const actuals = []
  class One {
    middleware () {
      return function (ctx) {
        ctx.app.emit('verbose', 'something.test')
      }
    }
  }
  const lws = new Lws()
  lws.on('verbose', (key, value) => {
    actuals.push(key)
  })
  lws.listen({ port, stack: One })
  await fetch(`http://127.0.0.1:${port}`)
  lws.server.close()
  a.ok(actuals.includes('something.test'))
})
