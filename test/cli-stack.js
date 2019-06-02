const Tom = require('test-runner').Tom
const LwsCli = require('../lib/cli-app')
const a = require('assert')
const fetch = require('node-fetch')

const tom = module.exports = new Tom('cli-stack')

tom.test('no middleware', async function () {
  const port = 9300 + this.index
  const origArgv = process.argv.slice()
  process.argv = [ 'node', 'something', '--port', `${port}` ]
  const cli = new LwsCli({
    logError: function () {}
  })
  const server = cli.start()
  process.argv = origArgv
  const response = await fetch(`http://127.0.0.1:${port}/`)
  server.close()
  a.strictEqual(response.status, 404)
})

tom.test('one middleware', async function () {
  const port = 9300 + this.index
  const cli = new LwsCli({ logError: function () {} })
  const server = cli.start([ '--port', `${port}`, '--stack', 'test/fixture/one.js' ])
  const response = await fetch(`http://localhost:${port}`)
  server.close()
  const body = await response.text()
  a.strictEqual(body, 'one')
})

tom.test('two middlewares', async function () {
  const port = 9300 + this.index
  const cli = new LwsCli({ logErrorx: function () {} })
  const argv = [ '--port', `${port}`, '--stack', 'test/fixture/one.js', 'test/fixture/two.js' ]
  const server = cli.start(argv)
  const response = await fetch(`http://localhost:${port}`)
  server.close()
  const body = await response.text()
  a.strictEqual(body, 'onetwo')
})

tom.test('one middleware with cli option', async function () {
  const port = 9300 + this.index
  const cli = new LwsCli({ logError: function () {} })
  const argv = [ '--port', `${port}`, '--stack', 'test/fixture/one.js', '--something', 'yeah' ]
  let server = cli.start(argv)
  const response = await fetch(`http://localhost:${port}`)
  server.close()
  const body = await response.text()
  a.strictEqual(body, 'yeah')
})
