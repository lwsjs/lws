import TestRunner from 'test-runner'
import assert from 'assert'
import Lws from 'lws'
import sleep from 'sleep-anywhere'

const a = assert.strict
const tom = new TestRunner.Tom()

tom.test('custom view write', async function () {
  const actuals = []
  class One {
    write (key, value, config) {
      actuals.push(key, value, config)
    }
  }
  const port = 9950 + this.index
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

export default tom
