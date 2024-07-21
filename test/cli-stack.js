import LwsCli from 'lws/lib/cli-app.mjs'
import fetch from 'node-fetch'
import TestRunner from 'test-runner'
import assert from 'assert'
const a = assert.strict

const tom = new TestRunner.Tom({ maxConcurrency: 1 })

tom.test('no middleware', async function () {
  const port = 9300 + this.index
  const cli = new LwsCli({
    logError: console.error
  })
  const server = await cli.start(['--port', `${port}`])
  if (process.exitCode) {
    server.close()
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
  const server = await cli.start(['--port', `${port}`, '--stack', 'test/fixture/one.js'])
  if (process.exitCode) {
    server.close()
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
  const argv = ['--port', `${port}`, '--stack', 'test/fixture/one.js', 'test/fixture/two.js']
  const server = await cli.start(argv)
  if (process.exitCode) {
    server.close()
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
  const argv = ['--port', `${port}`, '--stack', 'test/fixture/one.js', '--something', 'yeah']
  const server = await cli.start(argv)
  if (process.exitCode) {
    server.close()
    throw new Error('CLI failed - check log')
  }
  const response = await fetch(`http://localhost:${port}`)
  server.close()
  const body = await response.text()
  a.equal(body, 'yeah')
})

export default tom
