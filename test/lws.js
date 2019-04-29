const Tom = require('test-runner').Tom
const a = require('assert')
const Lws = require('../index')
const request = require('req-then')

const tom = module.exports = new Tom('lws')

tom.test('lws.listen', async function () {
  const lws = new Lws()
  const port =  9900 + this.index
  const server = lws.listen({
    configFile: 'test/fixture/lws.config.js',
    moduleDir: 'test/fixture',
    port,
  })
  const response = await request(`http://localhost:${port}/`)
  server.close()
  a.strictEqual(response.res.statusCode, 200)
  a.strictEqual(response.data.toString(), 'two')
})