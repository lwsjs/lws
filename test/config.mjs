import TestRunner from 'test-runner'
import assert from 'assert'
import Lws from 'lws'
import fetch from 'node-fetch'
const a = assert.strict

const tom = new TestRunner.Tom()

tom.test('custom configFile', async function () {
  const port = 9900 + this.index
  const lws = await Lws.create({
    configFile: 'test/fixture/lws.config.mjs',
    moduleDir: './test/fixture',
    port
  })
  try {
    const response = await fetch(`http://localhost:${port}/`)
    a.equal(response.status, 200)
    const body = await response.text()
    a.equal(body, 'two')
  } finally {
    lws.server.close()
  }
})

export default tom
