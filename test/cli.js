const Tom = require('test-runner').Tom
const a = require('assert')
const LwsCli = require('../lib/cli-app')
const fetch = require('node-fetch')
const sleep = require('sleep-anywhere')

const tom = module.exports = new Tom('cli')

tom.test('cli.run', async function () {
  const port = 7500 + this.index
  const origArgv = process.argv.slice()
  process.argv = [ 'node', 'something', '--port', `${port}` ]
  const server = LwsCli.run()
  process.argv = origArgv
  const response = await fetch(`http://127.0.0.1:${port}/`)
  server.close()
  a.strictEqual(response.status, 404)
})

tom.test('cli.run: bad option, should fail and printError', async function () {
  const origArgv = process.argv.slice()
  const origExitCode = process.exitCode
  process.argv = [ 'node', 'something', '--should-fail' ]
  const server = LwsCli.run()
  process.argv = origArgv
  a.strictEqual(server, undefined)
  a.strictEqual(process.exitCode, 1)
  process.exitCode = origExitCode
})

tom.test('cli.run: port not available', async function () {
  const port = 7500 + this.index
  const events = []
  const origArgv = process.argv.slice()
  process.argv = [ 'node', 'something', '--port', `${port}` ]
  const server = LwsCli.run()
  const server2 = LwsCli.run()
  server2.on('error', err => {
    events.push('server2 fail')
    server.close()
    server2.close()
  })
  await sleep(10)
  a.deepStrictEqual(events, [ 'server2 fail' ])
  process.argv = origArgv
})

tom.test('cli.run: --help', async function () {
  const origArgv = process.argv.slice()
  process.argv = [ 'node', 'something', '--help' ]
  LwsCli.run()
  process.argv = origArgv
})

tom.test('cli.run: --version', async function () {
  const origArgv = process.argv.slice()
  process.argv = [ 'node', 'something', '--version' ]
  LwsCli.run()
  process.argv = origArgv
})

tom.test('cli.run: --config', async function () {
  const origArgv = process.argv.slice()
  process.argv = [ 'node', 'something', '--config' ]
  LwsCli.run()
  process.argv = origArgv
})
