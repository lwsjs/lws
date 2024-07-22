import assert from 'assert'
import Lws from 'lws'
import sleep from 'sleep-anywhere'

const a = assert.strict
const test = new Map()

test.set('custom view write', async function () {
  const actuals = []
  class One {
    write (key, value, config) {
      actuals.push(key, value, config)
    }
  }
  const port = 9951
  const lws = await Lws.create({
    port,
    maxConnections: 11,
    keepAliveTimeout: 11,
    view: new One()
  })
  lws.server.close()
  await sleep(10)
  a.equal(actuals[0], 'server.config')
})

export { test }
