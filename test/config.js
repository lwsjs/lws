import assert from 'assert'
import Lws from 'lws'
import fetch from 'node-fetch'
const a = assert.strict

const test = new Map()

test.set('custom configFile', async function () {
  const port = 9801
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

export { test }
