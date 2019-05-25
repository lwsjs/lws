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
  const cli = new LwsCli({
    logError: function () {}
  })
  const server = cli.start()
  process.argv = origArgv
  const response = await fetch(`http://127.0.0.1:${port}/`)
  server.close()
  a.strictEqual(response.status, 404)
})

tom.test('cli.run: bad option, should fail and printError', async function () {
  const origArgv = process.argv.slice()
  process.argv = [ 'node', 'something', '--should-fail' ]
  let logMsg
  const cli = new LwsCli({
    logError: function (msg) {
      logMsg = msg
    }
  })
  a.throws(
    () => cli.start(),
    /Unknown option: --should-fail/
  )
  process.argv = origArgv
})

tom.test('cli.run: port not available', async function () {
  const port = 7500 + this.index
  const actuals = []
  const origArgv = process.argv.slice()
  let logMsg = ''
  process.argv = [ 'node', 'something', '--port', `${port}` ]
  const cli = new LwsCli({ logError: function () {} })
  const server = cli.start()
  const server2 = cli.start()
  server2.on('error', err => {
    actuals.push(err.message)
    server.close()
    server2.close()
  })
  await sleep(10)
  a.deepStrictEqual(actuals.length, 1)
  a.ok(/EADDRINUSE/.test(actuals[0]))
  process.argv = origArgv
})

tom.test('cli.run: --help', async function () {
  const origArgv = process.argv.slice()
  process.argv = [ 'node', 'something', '--help' ]
  let usage = null
  const cli = new LwsCli({
    log: function (msg) {
      usage = msg
    }
  })
  cli.start()
  process.argv = origArgv
  a.ok(/modular web server/.test(usage))
})

tom.test('cli.run: --version', async function () {
  const origArgv = process.argv.slice()
  process.argv = [ 'node', 'something', '--version' ]
  let logMsg = ''
  const cli = new LwsCli({
    log: function (msg) { logMsg = msg }
  })
  cli.start()
  const version = require('../package.json').version
  a.strictEqual(version, logMsg.trim())
  process.argv = origArgv
})

tom.test('cli.run: --config', async function () {
  const origArgv = process.argv.slice()
  process.argv = [ 'node', 'something', '--config' ]
  let logMsg = ''
  const cli = new LwsCli({
    log: function (msg) { logMsg = msg }
  })
  cli.start()
  a.ok(/CliView/.test(logMsg))
  process.argv = origArgv
})
