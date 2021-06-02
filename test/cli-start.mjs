import TestRunner from 'test-runner'
import assert from 'assert'
import LwsCli from '../lib/cli-app.mjs'
import sleep from 'sleep-anywhere'
import * as fs from 'fs/promises'
import path from 'path'
import getModulePaths from 'current-module-paths'
const __dirname = getModulePaths(import.meta.url).__dirname
const a = assert.strict

const tom = new TestRunner.Tom()

tom.test('bad option, should fail and printError', async function () {
  const origExitCode = process.exitCode
  let logMsg = ''
  const cli = new LwsCli({
    logError: function (msg) { logMsg = msg }
  })
  await cli.start(['--should-fail'])
  a.ok(/--should-fail/.test(logMsg))
  process.exitCode = origExitCode
})

tom.test('port not available', async function () {
  const port = 7500 + this.index
  const actuals = []
  const origExitCode = process.exitCode
  const cli = new LwsCli({
    logError: function () {},
    log: function () {}
  })
  const server = await cli.start(['--port', `${port}`])
  const server2 = await cli.start(['--port', `${port}`])
  server2.on('error', err => {
    actuals.push(err.message)
    server.close()
    server2.close()
  })
  await sleep(10)
  a.deepEqual(actuals.length, 1)
  a.ok(/EADDRINUSE/.test(actuals[0]))
  process.exitCode = origExitCode
})

tom.test('--help', async function () {
  let usage = null
  const cli = new LwsCli({
    log: function (msg) {
      usage = msg
    }
  })
  await cli.start(['--help'])
  a.ok(/Synopsis/.test(usage))
})

tom.test('--version', async function () {
  let logMsg = ''
  const cli = new LwsCli({
    log: function (msg) { logMsg = msg }
  })
  await cli.start(['--version'])
  const version = JSON.parse(await fs.readFile(path.resolve(__dirname, '..', 'package.json'), 'utf8')).version
  a.equal(version, logMsg.trim())
})

tom.test('--config', async function () {
  let logMsg = ''
  const cli = new LwsCli({
    log: function (msg) { logMsg = msg }
  })
  await cli.start(['--config', '--https'])
  a.ok(/https/.test(logMsg))
})

tom.test('--list-network-interfaces', async function () {
  let logMsg = ''
  const cli = new LwsCli({
    log: function (msg) { logMsg = msg }
  })
  await cli.start(['--list-network-interfaces'])
  a.ok(/Available network interfaces/.test(logMsg))
  a.ok(/en0/.test(logMsg))
})

if (process.env.TESTOPEN) {
  tom.test('--open', async function () {
    const cli = new LwsCli({
      log: function () { }
    })
    const server = await cli.start(['--open'])
    server.close()
  })

  tom.test('--open --https', async function () {
    const cli = new LwsCli({
      log: function () { }
    })
    const server = await cli.start(['--open', '--https'])
    server.close()
  })
}

export default tom
