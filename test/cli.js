const Tom = require('test-runner').Tom
const a = require('assert')
const CliApp = require('../lib/cli-app')
const request = require('req-then')
const sleep = require('sleep-anywhere')

const tom = module.exports = new Tom('cli')

tom.test('cli.run', async function () {
  const port = 7500 + this.index
  const origArgv = process.argv.slice()
  process.argv = [ 'node', 'something', '--port', `${port}` ]
  const server = CliApp.run()
  process.argv = origArgv
  const response = await request(`http://127.0.0.1:${port}/`)
  server.close()
  a.strictEqual(response.res.statusCode, 404)
})

tom.test('cli.run: bad option, should fail and printError', async function () {
  const origArgv = process.argv.slice()
  const origExitCode = process.exitCode
  process.argv = [ 'node', 'something', '--should-fail' ]
  const server = CliApp.run()
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
  const server = CliApp.run()
  const server2 = CliApp.run()
  server2.on('error', err => {
      events.push('server2 fail')
      server.close()
      server2.close()
  })
  await sleep(10)
  a.deepStrictEqual(events, [ 'server2 fail' ])
})

tom.test('cli.run: --help', async function () {
  const origArgv = process.argv.slice()
  process.argv = [ 'node', 'something', '--help' ]
  CliApp.run()
  process.argv = origArgv
})

tom.test('cli.run: --version', async function () {
  const origArgv = process.argv.slice()
  process.argv = [ 'node', 'something', '--version' ]
  CliApp.run()
  process.argv = origArgv
})

tom.test('cli.run: --config', async function () {
  const origArgv = process.argv.slice()
  process.argv = [ 'node', 'something', '--config' ]
  CliApp.run()
  process.argv = origArgv
})
