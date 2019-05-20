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
  const server = LwsCli.run({
    logError: function () {}
  })
  process.argv = origArgv
  const response = await fetch(`http://127.0.0.1:${port}/`)
  server.close()
  a.strictEqual(response.status, 404)
})

tom.test('cli.run: bad option, should fail and printError', async function () {
  const origArgv = process.argv.slice()
  const origExitCode = process.exitCode
  process.argv = [ 'node', 'something', '--should-fail' ]
  let logMsg
  const server = LwsCli.run({
    logError: function (msg) {
      logMsg = msg
    }
  })
  a.ok(/Unknown option: --should-fail/.test(logMsg))
  process.argv = origArgv
  a.strictEqual(server, undefined)
  a.strictEqual(process.exitCode, 1)
  process.exitCode = origExitCode
})

tom.test('cli.run: port not available', async function () {
  const port = 7500 + this.index
  const events = []
  const origArgv = process.argv.slice()
  let logMsg = ''
  process.argv = [ 'node', 'something', '--port', `${port}` ]
  const server = LwsCli.run({
    logError: function () {}
  })
  const server2 = LwsCli.run({
    logError: function (msg) {
      logMsg = msg
    }
  })
  server2.on('error', err => {
    events.push('server2 fail')
    server.close()
    server2.close()
  })
  await sleep(10)
  a.deepStrictEqual(events, [ 'server2 fail' ])
  a.ok(/EADDRINUSE/.test(logMsg))
  process.argv = origArgv
})

tom.test('cli.run: --help', async function () {
  const origArgv = process.argv.slice()
  process.argv = [ 'node', 'something', '--help' ]
  let usage = null
  LwsCli.run({
    log: function (msg) {
      usage = msg
    }
  })
  process.argv = origArgv
  a.ok(/modular web server/.test(usage))
})

tom.test('cli.run: --version', async function () {
  const origArgv = process.argv.slice()
  process.argv = [ 'node', 'something', '--version' ]
  let logMsg = ''
  LwsCli.run({
    log: function (msg ) { logMsg = msg }
  })
  const version = require('../package.json').version
  a.strictEqual(version, logMsg.trim())
  process.argv = origArgv
})

tom.test('cli.run: --config', async function () {
  const origArgv = process.argv.slice()
  process.argv = [ 'node', 'something', '--config' ]
  let logMsg = ''
  LwsCli.run({
    log: function (msg ) { logMsg = msg }
  })
  a.ok(/CliView/.test(logMsg))
  process.argv = origArgv
})
