const Tom = require('test-runner').Tom
const a = require('assert')
const Lws = require('../')
const sleep = require('sleep-anywhere')

const tom = module.exports = new Tom('lws-view')

tom.test('custom view write', async function () {
  const actuals = []
  class One {
    write (key, value, config) {
      actuals.push(key, value, config)
    }
  }
  const port = 9950 + this.index
  const lws = new Lws()
  lws.listen({
    port,
    maxConnections: 11,
    keepAliveTimeout: 11,
    view: new One(),

  })
  lws.server.close()
  await sleep(10)
  a.strictEqual(actuals[0], 'server.config')
})
