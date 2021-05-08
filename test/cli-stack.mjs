import LwsCli from '../lib/cli-app.mjs'
import fetch from 'node-fetch'
import TestRunner from 'test-runner'
import assert from 'assert'
const a = assert.strict

const tom = new TestRunner.Tom()

tom.test('no middleware', async function () {
  const port = 9300 + this.index
  const origArgv = process.argv.slice()
  const cli = new LwsCli({
    logError: console.error
  })
  const server = await cli.start(['--port', `${port}`])
  if (process.exitCode) {
    throw new Error('CLI failed - check log')
  }
  try {
    const response = await fetch(`http://127.0.0.1:${port}/`)
    a.equal(response.status, 404)
  } finally {
    server.close()
  }
})

tom.test('one middleware', async function () {
  const port = 9300 + this.index
  const cli = new LwsCli({ logError: console.error })
  const server = await cli.start(['--port', `${port}`, '--stack', 'test/fixture/one.mjs'])
  if (process.exitCode) {
    throw new Error('CLI failed - check log')
  }
  const response = await fetch(`http://localhost:${port}`)
  server.close()
  const body = await response.text()
  a.equal(body, 'one')
})

tom.test('two middlewares', async function () {
  const port = 9300 + this.index
  const cli = new LwsCli({ logError: console.error })
  const argv = ['--port', `${port}`, '--stack', 'test/fixture/one.mjs', 'test/fixture/two.mjs']
  const server = await cli.start(argv)
  if (process.exitCode) {
    throw new Error('CLI failed - check log')
  }
  const response = await fetch(`http://localhost:${port}`)
  server.close()
  const body = await response.text()
  a.equal(body, 'onetwo')
})

tom.test('one middleware with cli option', async function () {
  const port = 9300 + this.index
  const cli = new LwsCli({ logError: console.error })
  const argv = ['--port', `${port}`, '--stack', 'test/fixture/one.mjs', '--something', 'yeah']
  const server = await cli.start(argv)
  if (process.exitCode) {
    throw new Error('CLI failed - check log')
  }
  const response = await fetch(`http://localhost:${port}`)
  server.close()
  const body = await response.text()
  a.equal(body, 'yeah')
})

export default tom
