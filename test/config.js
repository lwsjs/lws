const Tom = require('test-runner').Tom
const a = require('assert')
const Lws = require('../index')
const fetch = require('node-fetch')

const tom = module.exports = new Tom('config')

tom.test('configFile', async function () {
  const port = 9900 + this.index
  const lws = Lws.create({
    configFile: 'test/fixture/lws.config.js',
    moduleDir: './test/fixture',
    port
  })
  const response = await fetch(`http://localhost:${port}/`)
  lws.server.close()
  a.strictEqual(response.status, 200)
  const body = await response.text()
  a.strictEqual(body, 'two')
})
